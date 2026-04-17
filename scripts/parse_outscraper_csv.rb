#!/usr/bin/env ruby
# frozen_string_literal: true

# parse_outscraper_csv.rb
# Parses an Outscraper Google Maps CSV export into the hue-ni Place JSON schema.
#
# Usage:
#   ruby scripts/parse_outscraper_csv.rb <input.csv> [options]
#
# Options:
#   --category CATEGORY      App category for all rows (default: cafe)
#   --collection COLLECTION  Collection ID to assign to every place (optional)
#   --output FILE            Write JSON to this file instead of stdout
#   --merge FILE             Upsert new places into an existing places.json by ID
#   --min-rating N           Skip places with rating below N (default: 0)
#   --operational-only       Skip places where business_status != OPERATIONAL
#
# Examples:
#   # Preview parsed output:
#   ruby scripts/parse_outscraper_csv.rb 'Outscraper-*.csv'
#
#   # Write cafes to a standalone file:
#   ruby scripts/parse_outscraper_csv.rb Outscraper-20260414155000s59.csv \
#     --category cafe \
#     --output scripts/data/cafes.json
#
#   # Merge directly into the app's data file, replacing same IDs:
#   ruby scripts/parse_outscraper_csv.rb Outscraper-20260414155000s59.csv \
#     --category cafe \
#     --collection kim-long-cafes \
#     --merge src/data/places.json

require 'csv'
require 'json'
require 'optparse'

# ---------------------------------------------------------------------------
# CLI options
# ---------------------------------------------------------------------------

options = {
  category:         'cafe',
  collection:       nil,
  output:           nil,
  merge:            nil,
  min_rating:       0.0,
  operational_only: false,
}

OptionParser.new do |opts|
  opts.banner = "Usage: ruby scripts/parse_outscraper_csv.rb <input.csv> [options]"

  opts.on('--category CAT',      'App category (tomb|landmark|cafe|food|homestay|service). Default: cafe') { |v| options[:category] = v }
  opts.on('--collection ID',     'Collection ID to assign to all places')                                   { |v| options[:collection] = v }
  opts.on('--output FILE',       'Output JSON file path (default: stdout)')                                 { |v| options[:output] = v }
  opts.on('--merge FILE',        'Upsert into existing places.json, replacing entries with the same ID')    { |v| options[:merge] = v }
  opts.on('--min-rating N',      Float, 'Skip places below this rating (default: 0)')                      { |v| options[:min_rating] = v }
  opts.on('--operational-only',  'Skip places where business_status is not OPERATIONAL')                    { options[:operational_only] = true }
  opts.on('-h', '--help',        'Show this help')                                                          { puts opts; exit }
end.parse!

csv_path = ARGV.first
abort "Error: no CSV file specified.\nRun with --help for usage." unless csv_path
abort "Error: file not found: #{csv_path}" unless File.exist?(csv_path)

# ---------------------------------------------------------------------------
# Vietnamese diacritic slugifier  (reused from fetch_hue_places.rb)
# ---------------------------------------------------------------------------

DIACRITIC_MAP = {
  /[àáâãăắặằẳẵấầẩẫậ]/  => 'a',
  /[đ]/                  => 'd',
  /[èéêẹẻẽếềệểễ]/       => 'e',
  /[ìíịỉĩ]/             => 'i',
  /[òóôõơọỏốồổỗợớờởỡ]/ => 'o',
  /[ùúưụủũứừựửữ]/       => 'u',
  /[ỳýỵỷỹ]/             => 'y',
  /[ÀÁÂÃĂẮẶẰẲẴẤẦẨẪẬ]/  => 'a',
  /[Đ]/                  => 'd',
  /[ÈÉÊẸẺẼẾỀỆỂỄ]/       => 'e',
  /[ÌÍỊỈĨ]/             => 'i',
  /[ÒÓÔÕƠỌỎỐỒỔỖỢỚỜỞỠ]/ => 'o',
  /[ÙÚƯỤỦŨỨỪỰỬỮ]/       => 'u',
  /[ỲÝỴỶỸ]/             => 'y',
}.freeze

def slugify(name)
  s = name.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')
  DIACRITIC_MAP.each { |pat, rep| s = s.gsub(pat, rep) }
  s.downcase
   .gsub(/[^a-z0-9\s-]/, '')
   .gsub(/\s+/, '-')
   .gsub(/-+/, '-')
   .strip
   .delete_prefix('-')
   .delete_suffix('-')
end

# ---------------------------------------------------------------------------
# Price range
# ---------------------------------------------------------------------------

def map_price_range(range_str)
  case range_str.to_s.count('$')
  when 1 then '₫'
  when 2 then '₫₫'
  when 3 then '₫₫₫'
  else        '₫'      # default when field is empty
  end
end

# ---------------------------------------------------------------------------
# Working-hours parser  (handles the CSV's compact 12-hour format)
#
# CSV stores working_hours as a JSON string whose values are arrays, e.g.:
#   {"Monday": ["7AM-5:30PM"], "Tuesday": ["7AM-5:30PM"], ...}
#   {"Monday": ["Open 24 hours"]}
#   {"Monday": ["5:30-11AM"]}   ← open has no AM/PM; infer from close
# ---------------------------------------------------------------------------

def parse_hours(working_hours_json)
  return default_hours if working_hours_json.nil? || working_hours_json.strip.empty?

  data = JSON.parse(working_hours_json)

  # Pick the first day that has a real time string (not "Closed")
  time_str = data.values
                 .find { |v| v.is_a?(Array) && v.first.to_s =~ /\d/i && v.first.to_s !~ /closed/i }
                 &.first
                 &.strip

  return default_hours unless time_str
  return { 'open' => '00:00', 'close' => '23:59' } if time_str =~ /open 24 hours/i

  # Formats: "7AM-5:30PM", "6:30AM-10PM", "5:30-11AM"
  # Split on the hyphen that separates open from close (the one not inside a time).
  # Pattern: capture everything up to the last '-' before a digit/end
  parts = time_str.split('-')

  # If 3 parts, the middle '-' was inside a time component (e.g. "5:30-11-AM" won't
  # happen, but guard anyway). Two parts is the normal case.
  open_raw  = parts[0]&.strip.to_s
  close_raw = parts[1..]&.join('-')&.strip.to_s

  # Infer AM/PM for open when only close carries it  ("5:30-11AM" → open gets AM)
  if (period = close_raw.match(/(AM|PM)/i)&.[](1)) && open_raw !~ /AM|PM/i
    open_raw = "#{open_raw} #{period}"
  end

  { 'open' => to_24h(open_raw), 'close' => to_24h(close_raw) }
rescue JSON::ParserError
  default_hours
end

def default_hours
  { 'open' => '08:00', 'close' => '22:00' }
end

# Convert "7AM" / "5:30PM" / "6:30 AM" → "07:00" / "17:30" / "06:30"
def to_24h(str)
  return '00:00' if str.nil? || str.empty?

  m = str.strip.match(/\A(\d+)(?::(\d+))?\s*(AM|PM)\z/i)
  return '00:00' unless m

  h   = m[1].to_i
  min = (m[2] || '0').to_i
  per = m[3].upcase

  h += 12 if per == 'PM' && h != 12
  h  = 0  if per == 'AM' && h == 12

  format('%02d:%02d', h, min)
end

# ---------------------------------------------------------------------------
# Address cleaner  — strips postal codes and "Vietnam" country suffix
# ---------------------------------------------------------------------------

def clean_address(raw)
  raw.to_s
     .sub(/,?\s*\d{5,6}(?=\s*,|\s*$)/, '')  # postal code (5-6 digits)
     .sub(/,?\s*Vietnam\s*\z/i, '')           # country suffix
     .gsub(/,\s*,/, ',')                      # double commas from above removals
     .strip
end

# ---------------------------------------------------------------------------
# Tags — map English Google subtypes to Vietnamese equivalents
# ---------------------------------------------------------------------------

SUBTYPE_VI = {
  'coffee shop'       => 'cà phê',
  'café'              => 'cà phê',
  'cafe'              => 'cà phê',
  'specialty coffee'  => 'specialty coffee',
  'tea house'         => 'trà',
  'bubble tea'        => 'trà sữa',
  'bakery'            => 'bánh ngọt',
  'breakfast'         => 'điểm tâm',
  'wi-fi spot'        => 'wifi',
  'bar'               => 'bar',
  'restaurant'        => 'nhà hàng',
  'fast food'         => 'đồ ăn nhanh',
  'hotel'             => 'khách sạn',
  'homestay'          => 'homestay',
  'tourist attraction'=> 'danh lam',
  'museum'            => 'bảo tàng',
  'temple'            => 'đền chùa',
  'pagoda'            => 'chùa',
}.freeze

def map_tags(subtypes_str)
  subtypes_str.to_s
              .split(',')
              .map(&:strip)
              .map { |s| SUBTYPE_VI[s.downcase] || s.downcase }
              .reject(&:empty?)
              .uniq
end

# ---------------------------------------------------------------------------
# Huế bounding box filter
# ---------------------------------------------------------------------------

HUE_BOUNDS = { lat_min: 16.35, lat_max: 16.55, lng_min: 107.50, lng_max: 107.70 }.freeze

def in_hue?(lat, lng)
  lat.between?(HUE_BOUNDS[:lat_min], HUE_BOUNDS[:lat_max]) &&
    lng.between?(HUE_BOUNDS[:lng_min], HUE_BOUNDS[:lng_max])
end

# ---------------------------------------------------------------------------
# Row → Place
# ---------------------------------------------------------------------------

def map_row(row, category:, collection:)
  lat = row['latitude'].to_f
  lng = row['longitude'].to_f

  {
    'id'          => slugify(row['name'].to_s),
    'name'        => row['name'].to_s,
    'category'    => category,
    'tags'        => map_tags(row['subtypes']),
    'coverImage'  => row['photo'].to_s,
    'gallery'     => [],
    'address'     => clean_address(row['address']),
    'coordinates' => { 'lat' => lat, 'lng' => lng },
    'rating'      => row['rating'].to_f.round(1),
    'priceRange'  => map_price_range(row['range']),
    'hours'       => parse_hours(row['working_hours']),
    'vibe'        => '',             # fill in manually
    'description' => row['description'].to_s,
    'insiderTips' => [],             # fill in manually
    'collection'  => collection,
    'phone'       => row['phone'].to_s.strip.then { |p| p.empty? ? nil : p },
    'website'     => row['website'].to_s.strip.then { |w| w.empty? ? nil : w },
    'logo'        => row['logo'].to_s.strip.then { |l| l.empty? ? nil : l },
  }.compact   # remove nil-valued keys so JSON stays clean
end

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

warn "Parsing: #{csv_path}"

places   = []
skipped  = []

CSV.foreach(csv_path, headers: true, encoding: 'UTF-8') do |row|
  name   = row['name'].to_s
  lat    = row['latitude'].to_f
  lng    = row['longitude'].to_f
  rating = row['rating'].to_f
  status = row['business_status'].to_s.upcase

  # Bounding-box filter
  unless in_hue?(lat, lng)
    skipped << "#{name} — outside Huế bounds (#{lat}, #{lng})"
    next
  end

  # Operational filter
  if options[:operational_only] && status != 'OPERATIONAL'
    skipped << "#{name} — status: #{status}"
    next
  end

  # Rating filter
  if rating < options[:min_rating]
    skipped << "#{name} — rating #{rating} < #{options[:min_rating]}"
    next
  end

  place = map_row(row, category: options[:category], collection: options[:collection])
  places << place
  warn "  + #{place['name']}  (#{place['rating']}★, #{place['hours']['open']}–#{place['hours']['close']})"
end

warn "\nParsed #{places.size} place(s). Skipped #{skipped.size}."
skipped.each { |msg| warn "  skip: #{msg}" }

# ---------------------------------------------------------------------------
# Output
# ---------------------------------------------------------------------------

if options[:merge]
  # Upsert into existing places.json — replace by ID, keep everything else
  merge_path = options[:merge]
  abort "Error: merge file not found: #{merge_path}" unless File.exist?(merge_path)

  existing   = JSON.parse(File.read(merge_path))
  old_places = existing['places'] || []
  new_ids    = places.map { |p| p['id'] }.to_set

  # Keep existing places whose IDs are not being replaced
  kept = old_places.reject { |p| new_ids.include?(p['id']) }
  warn "\nMerging: replacing #{old_places.size - kept.size} existing entry/entries, adding #{places.size}."

  existing['places'] = kept + places
  File.write(merge_path, JSON.pretty_generate(existing))
  warn "Saved to: #{merge_path}"
else
  # Standalone output — wrap in the same shape as places.json for easy inspection
  output = JSON.pretty_generate({ 'places' => places })

  if options[:output]
    File.write(options[:output], output)
    warn "\nSaved to: #{options[:output]}"
  else
    puts output
  end
end
