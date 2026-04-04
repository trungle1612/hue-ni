PROJECT OVERVIEW
Product: A dedicated mobile-first travel web app for tourists visiting Hue.

Goal: To help visitors easily and instantly discover nearby local food, historical tombs, photo spots, and services.

Touchpoint: Users scan a QR code (placed at the airport, train station, hotels, or cafes) to open the web app directly in their mobile browser without downloading anything.

Tech Stack:

Frontend: ReactJS + TypeScript.

Backend: Ruby (Ruby on Rails).

Personal Data Storage: localStorage (No login or account creation required for the MVP).

Check /designs folder to see the design for each page.

📱 APP ARCHITECTURE
The application features a global Bottom Navigation Bar (🏠 Home and 🎒 My Trip) tying together 4 primary screens:

1️⃣ Onboarding Screen (Initial Pop-up)
Context-Aware Greeting: A dynamic welcome message based on where the QR code was scanned (e.g., scanning at the train station suggests nearby eateries).

Location Permission Request: The essential prompt asking for GPS access to enable the "Near Me" radar. Includes a "Skip" option for users who prefer manual searching.

Language Toggle: A quick switch between Vietnamese and English ([VN | EN]).

2️⃣ Home Page (Main Hub)
Search Bar & Quick Filters: A search input and horizontally scrollable category tags (Food, Tombs, Landmarks, Services).

View Toggle (List vs. Map):

List View: Horizontally swipable cards showing nearby places.

Map View: A map interface with location pins. Tapping a pin reveals a compact place card at the bottom of the screen.

"Near Me" Radar: Displays places within a specific radius, showing the exact calculated distance from the user and the Open/Closed status.

Curated Collections (Local Suggestions): Dynamic banners that change based on context, like time or weather (e.g., suggesting iced sweet soup on a hot afternoon or indoor cafes when it rains).

3️⃣ Location Detail Page
Core Information: High-quality cover image, place name, quick vibe/review, distance, operating hours, and price range.

Sticky Action Bar: Fixed to the screen for easy access:

[ 🧭 Get Directions ]: Deep-links directly to the native Google Maps app.

[ 📌 Add to My Trip ]: Saves the location to the browser's localStorage.

[ 🔗 Share ].

The "Insider" Edge (Unique Selling Point): Bite-sized local tips, such as historical trivia, advice on avoiding crowds, or an "Order Like a Local" cheat sheet (e.g., exactly what to say to the vendor and their best-selling dish).

4️⃣ "My Trip" Page (Saved Itinerary)
Empty State: If no places are saved, it displays a friendly illustration and a prompt encouraging the user to explore the Home page.

Smart Auto-Sorting: The saved list automatically reorders itself based on the user's current GPS location, putting the closest saved destinations at the very top.

Trip Management:

A quick [ 🧭 Route ] button next to each saved item.

A [ ❌ Remove ] button for individual items, and a [ 🗑️ Clear All ] button at the bottom to reset the itinerary.

💡 KEY UX/UI DESIGN PRINCIPLES
Mobile-First: Optimized for one-handed use and swiping gestures. Buttons are large and thumb-friendly.

Zero-Friction: No app store downloads and no user registration required. Tourists get immediate value the second they scan the QR code.

Performance Optimized: Images are heavily compressed and the map component is lazy-loaded to ensure the app loads in under 3 seconds, even on patchy 4G networks around the Citadel.