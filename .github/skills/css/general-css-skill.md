---
name: css
description: ## CSS Skill: Styling and Best Practices

This skill covers the use of CSS for styling React applications, with a focus on modular, maintainable, and scalable approaches. It is tailored to projects using:

- Modular SCSS partials (e.g., `_base.scss`, `_buttons.scss`, `_cards.scss`, etc.)
- Component-level styles (e.g., `App.scss`, `index.css`)
- Utility and theme files for colors, positions, and text

### When to Use
- To style React components and pages
- To organize and maintain scalable stylesheets
- For theming, responsive design, and UI consistency

### Best Practices
- **Use SCSS partials**: Split styles into logical files (base, buttons, cards, colors, etc.) for maintainability.
- **Component-level styles**: Scope styles to components when possible to avoid global conflicts.
- **Variables and mixins**: Use SCSS variables for colors, spacing, and fonts to ensure consistency and easy updates.
- **BEM or similar naming**: Use clear, descriptive class names to avoid collisions and improve readability.
- **Responsive design**: Use media queries and flexible units (%, rem, em) for layouts that adapt to different devices.
- **Avoid !important**: Use specificity and structure to manage overrides instead of relying on `!important`.
- **Minimize global styles**: Keep global styles minimal; prefer local/component styles for encapsulation.
- **Leverage CSS modules or SCSS modules**: For large projects, consider CSS modules for true style encapsulation.

### Keywords
css, scss, styles, theming, responsive, modular, best practices, BEM, variables, mixins, partials, React, UI
---

Define the functionality provided by this skill, including detailed instructions and examples
