# Design System Document: The Imperial Chronicler



## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Imperial Chronicler."**



This system is not a mere utility; it is a digital curation of heritage. We are moving away from the "template" aesthetic of modern travel sites toward a high-end editorial experience that feels like a private tour through the Citadel. The design philosophy centers on **Spatial Poetry**—the intentional use of "Ma" (negative space) to allow the content to breathe, combined with asymmetrical layouts that mimic the rhythmic flow of imperial gardens. We break the rigid grid by overlapping serif typography with silk-textured surfaces, creating a sense of depth, history, and quiet luxury.



## 2. Colors: Tonal Majesty

Our palette is rooted in the "Five Elements" of traditional Vietnamese aesthetics but refined for a modern, premium screen experience.



* **Primary (`#7d0010`) & Primary Container (`#a01d23`):** The "Imperial Red." Use these for high-intent actions and brand moments. They represent power and celebration.

* **Secondary (`#735c00`) & Secondary Fixed (`#ffe088`):** The "Royal Gold." Use for accents, refined labels, and iconography.

* **Tertiary (`#5e2b34`):** The "Dark Wood." This provides the grounding, sophisticated depth reminiscent of the Ngọ Môn Gate’s beams.

* **Surface Hierarchy:** We utilize the `surface-container` tiers (`lowest` to `highest`) to build a physical sense of layering.



### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section content. Boundaries must be defined solely through:

1. **Background Color Shifts:** Placing a `surface-container-low` section against a `surface` background.

2. **Tonal Transitions:** Using soft gradients between `surface-container` tiers.



### Glass & Gradient Rule

To move beyond "flat" UI, utilize **Glassmorphism** for floating navigation and modal elements. Use the `surface` color at 70% opacity with a `backdrop-filter: blur(20px)`. Main CTAs should not be flat; they should feature a subtle linear gradient from `primary` to `primary-container` at a 45-degree angle to provide a "silk-sheen" polish.



## 3. Typography: The Calligraphic Soul

Typography is the voice of the Chronicler. We pair the authoritative weight of traditional scripts with the precision of modern sans-serifs.



* **Headings (Noto Serif):** Our "Display" and "Headline" scales use Noto Serif. It evokes the elegance of Vietnamese calligraphy. Use `display-lg` (3.5rem) for hero moments, ensuring generous letter-spacing (-0.02em) to maintain a modern editorial feel.

* **Body & Labels (Plus Jakarta Sans):** For all functional text, use Plus Jakarta Sans. Its clean, geometric nature provides a high-contrast counterpoint to the serif headings, ensuring the UI feels "now" even while celebrating "then."

* **Hierarchy Note:** Always lead with a Serif headline, but use the Sans-Serif `label-md` in all-caps (tracked out to +10%) for "Overlines" (the small text above headlines) to establish a museum-grade information hierarchy.



## 4. Elevation & Depth: Atmospheric Layering

We eschew the "material" shadows of the past decade in favor of **Tonal Layering**.



* **The Layering Principle:** Depth is achieved by stacking. A card component should be `surface-container-lowest` placed upon a `surface-container-low` background. This creates a "recessed" or "lifted" look through color value alone.

* **Ambient Shadows:** If an element must float (e.g., a primary booking card), use an extra-diffused shadow.

* *Value:* `0px 20px 40px rgba(43, 22, 19, 0.06)`.

* Note that the shadow is tinted with the `on-surface` color (`#2b1613`), not black, to mimic natural light filtered through a courtyard.

* **The "Ghost Border" Fallback:** For accessibility in form fields, use the `outline-variant` token at **20% opacity**. Never use 100% opacity borders.

* **Signature Texture:** Apply a subtle noise texture or a "silk" grain overlay at 3% opacity across the `surface` level to give the digital screen the tactile quality of old paper.



## 5. Components

Each component is an "artifact." Use the `xl` (1.5rem) rounding scale to mimic the curved eaves of imperial roofs.



* **Buttons:**

* *Primary:* `primary` background, `on-primary` text, `xl` rounded corners. Subtle gradient required.

* *Secondary:* `secondary-container` background with `on-secondary-container` text. No border.

* **Cards:**

* **Strict Rule:** No dividers. Separate content using the Spacing Scale (minimum 2rem vertical gap) or by nesting a `surface-container-high` image block within a `surface-container` card.

* **Input Fields:**

* Use `surface-container-highest` for the input track. The label should be `label-md` in `on-surface-variant`. On focus, the background shifts to `surface-bright`.

* **Heritage Chips:**

* Used for categories (e.g., "Architecture," "Cuisine"). Use `tertiary-fixed` background with `on-tertiary-fixed` text.

* **The "Lotus" Loader:**

* Any loading state must use an animated "Hoa Sen" (Lotus) pattern in `secondary` (gold).



## 6. Do's and Don'ts



### Do:

* **Embrace Asymmetry:** Place a `headline-lg` on the left and the `body-lg` text slightly offset to the right.

* **Use Signature Patterns:** Incorporate the "Chữ Vạn" pattern as a subtle watermark (5% opacity) in the background of `surface-container-lowest` sections.

* **Prioritize Breathing Room:** If you think there is enough white space, add 20% more. Luxury is defined by the space you can afford to leave empty.



### Don't:

* **Don't use 1px Dividers:** Use background tonal shifts or a `surface-variant` horizontal rule that is only 50% of the container width and centered.

* **Don't use Pure Black:** Always use `on-background` (`#2b1613`) for text to maintain the warm, nostalgic atmosphere.

* **Don't use Sharp Corners:** Avoid the `none` or `sm` rounding tokens unless for very specific utility icons. The "Imperial Arch" (`xl`) is our signature.

* **Don't Over-Saturate:** Red (`primary`) is a spice, not the main dish. Use it for intent; use the `surface` and `surface-container` tones for the "peaceful" atmosphere.