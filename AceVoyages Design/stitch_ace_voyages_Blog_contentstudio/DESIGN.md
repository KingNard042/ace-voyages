# Design System: The Horizon Narrative

## 1. Overview & Creative North Star
The design system for ACE Voyages is built upon the Creative North Star of **"The Digital Concierge."** It moves away from the cluttered, transactional nature of traditional travel sites toward a high-end editorial experience that feels both authoritative and inviting. 

Instead of a rigid grid, we utilize **Intentional Asymmetry**. Imagery and text blocks overlap subtly to create a sense of movement and journey. This approach breaks the "template" look, replacing it with a bespoke, curated atmosphere that balances global professionalism with the warmth of Nigerian hospitality. By utilizing expansive white space (breathing room), we signify luxury and clarity, ensuring the user feels guided rather than overwhelmed.

---

## 2. Colors
Our palette is a sophisticated blend of trust-inducing blues and high-energy oranges, anchored by a rich range of neutral surfaces.

- **Primary (`#105fa3`):** The "Trust Anchor." Used for key brand moments and primary actions.
- **Secondary (`#914c00` / `#ff9b43`):** The "Sunset Glow." This provides a warm, energetic contrast, drawing the eye to call-to-actions (CTAs) and secondary highlights.
- **Surface Hierarchy:** We define depth through tonal shifts rather than lines.
- **The "No-Line" Rule:** 1px solid borders are strictly prohibited for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section should sit directly against a `surface` background to denote a change in context.
- **The "Glass & Gradient" Rule:** To achieve a premium feel, floating elements should use **Glassmorphism**. Apply semi-transparent surface colors (e.g., `primary_container` at 80% opacity) with a `backdrop-filter: blur(12px)`.
- **Signature Textures:** Use subtle linear gradients for main CTAs (transitioning from `primary` to `primary_container`) to provide visual "soul" and depth that flat colors cannot mimic.

---

## 3. Typography
Typography is our primary tool for editorial authority. We pair the geometric precision of **Manrope** with the high-readability of **Inter**, adding the script-like **Satisfy** for humanistic flourishes.

- **Display & Headlines (Manrope):** Large, bold, and unapologetic. The wide aperture of Manrope conveys openness. Use `display-lg` (3.5rem) for hero statements to create an immediate editorial impact.
- **Titles & Body (Inter):** Inter provides the reliability required for travel details. Use `title-md` (1.125rem) for destination names and `body-md` (0.875rem) for descriptions to ensure a clear information hierarchy.
- **The Human Touch (Satisfy):** Use the script font sparingly (e.g., "Your Journey" labels) to resonate with the vibrant, expressive nature of Nigerian culture, adding a layer of personalized service to the digital interface.

---

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Tonal Layering**, creating a UI that feels like stacked sheets of fine paper.

- **The Layering Principle:** Depth is achieved by stacking surface tokens. Place a `surface-container-lowest` card on a `surface-container-low` background. This creates a soft, natural lift.
- **Ambient Shadows:** For floating components like modals or mobile menus, use extra-diffused shadows: `box-shadow: 0 12px 40px rgba(26, 28, 28, 0.06);`. The shadow color is a tinted version of `on-surface`, never pure black.
- **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility, use a **Ghost Border**. This is the `outline-variant` token at 15% opacity. Never use 100% opaque borders.
- **Glassmorphism:** Use `surface_container_lowest` with 70% opacity and a heavy blur for navigation bars to allow travel imagery to bleed through, maintaining a sense of place.

---

## 5. Components
Each component is a "primitive" that must adhere to the **xl (1.5rem)** and **lg (1.0rem)** roundedness scale to feel modern and friendly.

- **Buttons:** 
    - *Primary:* Gradient fill (`primary` to `primary_container`), `xl` roundedness, high-contrast `on-primary` text.
    - *Secondary:* `surface-container-lowest` with a "Ghost Border" and `primary` text.
- **Cards:** Forbid divider lines. Use `surface_container_low` for the card body and `surface_container_lowest` for nested action areas. Use `spacing-lg` (1.5rem) as internal padding to maintain the spacious aesthetic.
- **Input Fields:** Use `surface_container_high` backgrounds with no border. On focus, transition to a `primary` ghost border. Labels use `label-md` in `on_surface_variant`.
- **Chips:** For travel categories (e.g., "Safari," "Business"), use `secondary_fixed` with `on_secondary_fixed` text for high visibility without the weight of a button.
- **Travel Itinerary Lists:** Instead of lines, use a vertical "Progress Bar" style line in `primary_fixed` to connect itinerary points, reflecting the concept of a journey.

---

## 6. Do's and Don'ts

### Do
- **Do** use high-quality, authentic Nigerian and global travel imagery that features people and sunlight.
- **Do** prioritize mobile-first layouts with large touch targets (minimum 48px).
- **Do** use `surface_bright` to highlight featured travel packages against the standard `surface` background.
- **Do** allow text to wrap naturally around overlapping images to reinforce the editorial feel.

### Don't
- **Don't** use 1px solid black or grey borders. They break the "Physical Layering" illusion.
- **Don't** use generic stock photography that feels disconnected from the Nigerian context.
- **Don't** use high-opacity shadows. If it looks like a "drop shadow," it is too dark.
- **Don't** crowd the layout. If a section feels "full," increase the vertical spacing by one level on the scale.