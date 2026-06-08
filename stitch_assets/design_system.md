# Design System: Civic Sentinel

## Brand & Style
The brand personality is rooted in institutional trust, precision, and unwavering authority. This design system serves a Police Theft Management System, requiring a UI that feels reliable under pressure and facilitates rapid data processing without cognitive fatigue.

The aesthetic follows a **Modern Corporate** approach with a strong lean toward **Minimalism**. Every interface element must justify its existence through utility. The emotional response should be one of calm control—transforming complex, often chaotic theft reports into structured, actionable intelligence. We prioritize clarity over decoration, using purposeful whitespace and high-quality typography to establish a hierarchy that guides the officer’s eye to critical information.

## Layout & Spacing
The layout follows a **Fixed Grid** model on desktop to ensure large data tables and case files remain readable and don't stretch excessively on ultrawide monitors.

- **Spacing Rhythm:** An 8px linear scale is the foundation. Generous `lg` (24px) or `xl` (32px) padding is required between major case sections to prevent the UI from feeling "cluttered" during high-stress data entry.
- **Breakpoints:**
  - **Mobile (<768px):** 1-column layout, 16px margins. Bottom navigation for key actions.
  - **Tablet (768px - 1024px):** 6-column grid. Side navigation collapses to icons.
  - **Desktop (>1024px):** 12-column grid. Persistent left-hand sidebar for navigation.

## Elevation & Depth
This design system avoids heavy shadows to maintain a clean, institutional look. Instead, it utilizes **Low-contrast outlines** and **Tonal layers**.

- **Surfaces:** The primary background is Off-white (#F8FAFC). Content "cards" are Pure White (#FFFFFF) with a 1px border in a lightened Slate Gray (#E2E8F0).
- **Depth:** Hover states on interactive cards should use a very subtle, diffused shadow (0px 4px 6px rgba(0,0,0,0.05)) to indicate interactivity without breaking the flat aesthetic. 
- **Modals:** Use a Backdrop Blur (8px) with a 40% opacity navy tint to focus the officer's attention on critical pop-up data entry or evidence confirmation.

## Components
- **Buttons:** Primary buttons use the Safety Blue background with White text. Secondary buttons use a transparent background with a Slate Gray border.
- **Data Tables:** These are the heart of the system. Use alternating row stripes (Off-white and White) for horizontal tracking. Headers must be Deep Navy with white text for maximum contrast.
- **Input Fields:** High-contrast borders (#CBD5E1) that darken to Primary Navy on focus. Validation errors must be clear, using the Soft Red status color and an icon.
- **Case Cards:** Each theft report should be encapsulated in a card. The top border should be color-coded based on case priority (e.g., Red for High, Gray for Low).
- **Evidence Uploader:** A dedicated drag-and-drop component with a dashed Slate Gray border, optimized for high-resolution photo uploads and file metadata entry.
- **Status Chips:** Small, high-contrast labels used within tables to show "Case Assigned," "Evidence Pending," or "Closed."
