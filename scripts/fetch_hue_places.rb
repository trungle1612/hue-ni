#!/usr/bin/env ruby
# frozen_string_literal: true

# fetch_hue_places.rb
# Fetches cafes, homestays, and heritage sites in Hue City from the
# Outscraper API (Google Maps data) and saves structured JSON to
# scripts/data/hue_places.json
#
# Usage:
#   OUTSCRAPER_API_KEY=your_key ruby scripts/fetch_hue_places.rb
#
# Optional env vars:
#   PLACES_LIMIT       — max places per search query (default: 20)
#   REVIEWS_LIMIT      — max reviews per place (default: 20)
#   SKIP_REVIEWS       — set to "true" to skip review fetching (faster, cheaper)
#   CATEGORY           — comma-separated filter, e.g. "cafe" or "cafe,homestay"

require 'net/http'
require 'json'
require 'uri'
require 'time'

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

ENV = {
  'OUTSCRAPER_API_KEY' => '',
  'PLACES_LIMIT' => 2,
  'REVIEWS_LIMIT' => 10,
  'SKIP_REVIEWS' => 'false',
  'CATEGORY' => 'cafe',
}
API_KEY          = ENV['OUTSCRAPER_API_KEY']
OUTPUT_FILE      = File.expand_path('../scripts/data/hue_places.json', __dir__)
PLACES_LIMIT     = (ENV['PLACES_LIMIT']  || '20').to_i
REVIEWS_LIMIT    = (ENV['REVIEWS_LIMIT'] || '20').to_i
SKIP_REVIEWS     = ENV['SKIP_REVIEWS'] == 'true'
CATEGORY_FILTER  = ENV['CATEGORY'] ? ENV['CATEGORY'].split(',').map(&:strip) : nil

BASE_URL = 'https://api.outscraper.cloud'

# Hue City center — passed as `coordinates` param so Outscraper's servers
# treat searches as if they originate from Hue (critical: servers may be abroad)
HUE_CENTER = '16.4637,107.5909'

# Hue City bounding box — used to filter out-of-area results
HUE_BOUNDS = { lat_min: 16.35, lat_max: 16.55, lng_min: 107.50, lng_max: 107.70 }.freeze

SEARCH_QUERIES = [
  { query: 'quán cà phê Huế',          category: 'cafe'      },
  { query: 'homestay Huế',             category: 'homestay'  },
  { query: 'di tích lịch sử Huế',      category: 'landmark'  },
  { query: 'lăng tẩm Huế',            category: 'landmark'  },
].freeze

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

# Strip Vietnamese diacritics and produce a URL-safe slug
def slugify(name)
  name = name.encode('UTF-8', invalid: :replace, undef: :replace, replace: '')

  # Vietnamese diacritic removal map
  replacements = {
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
  }

  replacements.each { |pattern, replacement| name = name.gsub(pattern, replacement) }

  name
    .downcase
    .gsub(/[^a-z0-9\s-]/, '')
    .gsub(/\s+/, '-')
    .gsub(/-+/, '-')
    .strip
    .delete_prefix('-')
    .delete_suffix('-')
end

# Map Outscraper range string ("$", "$$", "$$$") to app priceRange token
def map_price_range(range)
  case range.to_s.count('$')
  when 1 then '₫'
  when 2 then '₫₫'
  else        '₫₫₫'
  end
end

# Parse Outscraper working_hours hash to extract a representative open/close.
# Actual format: { "Monday" => "11:30 AM-3 PM,5-10 PM", "Tuesday" => "8 AM-11 PM", ... }
# Uses hyphen (-) as open/close separator, comma for multiple time ranges.
def parse_hours(working_hours)
  return { 'open' => '08:00', 'close' => '22:00' } unless working_hours.is_a?(Hash)

  # Pick the first day with a real schedule (not "Closed")
  day_str = working_hours.values.find { |v| v.is_a?(String) && v =~ /\d/i && v !~ /closed/i }
  return { 'open' => '08:00', 'close' => '22:00' } unless day_str

  # Multiple ranges are comma-separated (e.g. "11:30 AM-3 PM,5-10 PM")
  # Take open from first range, close from last range
  segments  = day_str.split(',').map(&:strip)
  open_str  = segments.first.split('-').first.strip
  close_str = segments.last.split('-').last.strip

  # If open has no AM/PM but close does, infer period from close
  # e.g. "5:30-9:30 PM" → open_str="5:30", close_str="9:30 PM"
  if (period = close_str.match(/(AM|PM)/i)&.[](1)) && open_str !~ /AM|PM/i
    open_str = "#{open_str} #{period}"
  end

  { 'open' => parse_time_12h(open_str), 'close' => parse_time_12h(close_str) }
end

# Convert "7 AM" / "10 PM" → "07:00" / "22:00"
def parse_time_12h(str)
  return '00:00' unless str

  str = str.strip
  match = str.match(/(\d+)(?::(\d+))?\s*(AM|PM)/i)
  return '00:00' unless match

  hour   = match[1].to_i
  minute = (match[2] || '0').to_i
  period = match[3].upcase

  hour += 12 if period == 'PM' && hour != 12
  hour  = 0  if period == 'AM' && hour == 12

  format('%02d:%02d', hour, minute)
end

# Return true if coordinates fall within Hue City bounding box
def in_hue?(lat, lng)
  lat.between?(HUE_BOUNDS[:lat_min], HUE_BOUNDS[:lat_max]) &&
    lng.between?(HUE_BOUNDS[:lng_min], HUE_BOUNDS[:lng_max])
end

# ---------------------------------------------------------------------------
# API client
# ---------------------------------------------------------------------------

def get(path, params = {})
  uri = URI("#{BASE_URL}#{path}")
  uri.query = URI.encode_www_form(params)

  req = Net::HTTP::Get.new(uri)
  req['X-API-KEY'] = API_KEY
  req['Accept']    = 'application/json'

  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl     = true
  http.read_timeout = 120
  http.open_timeout = 30

  res = http.request(req)
  puts "--------------------------------"
  puts res.body.inspect
  puts "--------------------------------"

  unless res.is_a?(Net::HTTPSuccess)
    warn "  HTTP #{res.code} from #{uri}: #{res.body[0, 200]}"
    return nil
  end

  JSON.parse(res.body)
rescue => e
  warn "  Request error for #{path}: #{e.message}"
  nil
end

# ---------------------------------------------------------------------------
# Search places
# ---------------------------------------------------------------------------

def search_places(query)
  puts "  Searching: #{query}"

  data = get('/google-maps-search', {
    query:       query,
    limit:       PLACES_LIMIT,
    coordinates: HUE_CENTER,  # anchors search to Hue City regardless of server location
    language:    'en',
    region:      'VN',
    async:       'false',
  })

  return [] if data.nil?

  # Response: { data: [[...places...]] } for a single query
  # First element of the outer array is the results for our query
  raw_list = data.dig('data', 0) || data['data'] || []
  raw_list = [raw_list] unless raw_list.first.is_a?(Array)
  raw_list = raw_list.flatten

  puts "  → #{raw_list.size} raw results"
  raw_list
rescue => e
  warn "  search_places error: #{e.message}"
  []
end

# ---------------------------------------------------------------------------
# Fetch reviews for a place
# ---------------------------------------------------------------------------

def fetch_reviews(place_id)
  return [] if SKIP_REVIEWS

  # TODO: verify this path against https://scraper.systems/api-docs#tag/google
  data = get('/google-maps-reviews', {
    query:        place_id,
    reviewsLimit: REVIEWS_LIMIT,
    language:     'en',
    sort:         'most_relevant',
    async:        'false',
  })

  return [] if data.nil?

  raw_list = data.dig('data', 0) || data['data'] || []
  raw_list = raw_list.flatten

  # Each element from reviews endpoint may itself be a place wrapper
  # with a nested `reviews` key, or a flat review object
  reviews = if raw_list.first.is_a?(Hash) && raw_list.first.key?('reviews')
              raw_list.first['reviews'] || []
            else
              raw_list
            end

  reviews.map do |r|
    {
      'author_name'  => r['author_title'] || r['name'] || '',
      'rating'       => r['review_rating'].to_f,
      'text'         => r['review_text'] || '',
      'published_at' => r['review_datetime_utc'] || r['published_at'] || '',
      'likes'        => (r['review_likes'] || 0).to_i,
    }
  end
rescue => e
  warn "  fetch_reviews error for #{place_id}: #{e.message}"
  []
end

# ---------------------------------------------------------------------------
# Map a raw Outscraper place to the app schema
# ---------------------------------------------------------------------------

def map_place(raw, category)
  lat  = raw['latitude'].to_f
  lng  = raw['longitude'].to_f

  # API returns a single `photo` URL; `street_view` is a wider crop of the same image.
  # Build a small gallery from both if both exist and differ.
  cover   = raw['photo'] || ''
  gallery = [raw['street_view']].compact.reject { |p| p == cover }

  # `subtypes` is a comma-separated string: "Café, Coffee shop, Wi-Fi spot"
  tags = raw['subtypes'].to_s.split(',').map(&:strip).reject(&:empty?)

  {
    'google_place_id'   => raw['place_id'] || '',
    'id'                => slugify(raw['name'] || 'unknown'),
    'name'              => raw['name'] || '',
    'category'          => category,
    'address'           => raw['full_address'] || raw['address'] || '',
    'coordinates'       => { 'lat' => lat, 'lng' => lng },
    'rating'            => (raw['rating'] || 0).to_f,
    'rating_count'      => (raw['reviews'] || 0).to_i,  # `reviews` = review count integer
    'priceRange'        => map_price_range(raw['range']),  # "$" / "$$" / "$$$"
    'phone'             => raw['phone'] || '',
    'website'           => raw['site'] || '',
    'hours'             => parse_hours(raw['working_hours']),
    'working_hours_raw' => raw['working_hours'] || {},
    'coverImage'        => cover,
    'gallery'           => gallery,
    'tags'              => tags,
    'vibe'              => '',
    'description'       => raw['description'] || '',
    'insiderTips'       => [],
    'collection'        => nil,
    'reviews'           => [],   # filled in after review fetch
  }
end

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

puts "=== Hue Places Fetcher ==="
puts "Output: #{OUTPUT_FILE}"
puts "Places limit per query: #{PLACES_LIMIT}"
puts "Reviews limit per place: #{REVIEWS_LIMIT}"
puts "Skip reviews: #{SKIP_REVIEWS}"
puts "Category filter: #{CATEGORY_FILTER&.join(', ') || 'all'}"
puts

all_places = []
seen_ids   = {}   # guard against duplicates across queries

active_queries = CATEGORY_FILTER ? SEARCH_QUERIES.select { |e| CATEGORY_FILTER.include?(e[:category]) } : SEARCH_QUERIES

active_queries.each do |entry|
  puts "\n[#{entry[:category].upcase}] #{entry[:query]}"

  raw_places = search_places(entry[:query])

  raw_places.each do |raw|
    lat = raw['latitude'].to_f
    lng = raw['longitude'].to_f

    unless in_hue?(lat, lng)
      puts "  Skip (out of bounds): #{raw['name']} (#{lat}, #{lng})"
      next
    end

    place = map_place(raw, entry[:category])
    place_id = raw['place_id']

    # Deduplicate by google_place_id
    if seen_ids[place_id]
      puts "  Skip (duplicate): #{place['name']}"
      next
    end
    seen_ids[place_id] = true

    unless SKIP_REVIEWS
      print "  Fetching reviews for: #{place['name']}... "
      reviews = fetch_reviews(place_id)
      place['reviews'] = reviews
      puts "#{reviews.size} reviews"
      sleep 0.5   # be polite to the API
    end

    all_places << place
    puts "  + Added: #{place['name']} (#{place['category']})"
  end
end

puts "\n=== Summary ==="
puts "Total places: #{all_places.size}"
active_queries.map { |e| e[:category] }.uniq.each do |cat|
  count = all_places.count { |p| p['category'] == cat }
  puts "  #{cat}: #{count}"
end

output = {
  'places'      => all_places,
  'collections' => [],
}

File.write(OUTPUT_FILE, JSON.pretty_generate(output))
puts "\nSaved to: #{OUTPUT_FILE}"
