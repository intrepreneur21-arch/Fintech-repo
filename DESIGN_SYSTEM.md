# Design System - AI Fintech Platform Builder

## Overview

This document defines the premium, elegant design system for the AI Fintech Platform Builder. Every component, interaction, and visual element follows these guidelines to maintain consistency and quality across the entire application.

## Color Palette

### Light Theme (Default)

| Token | OKLCH Value | Usage |
|-------|-------------|-------|
| `--background` | `oklch(0.99 0.001 0)` | Page background (near white) |
| `--foreground` | `oklch(0.2 0.01 65)` | Primary text (dark gray) |
| `--card` | `oklch(1 0 0)` | Card backgrounds (pure white) |
| `--card-foreground` | `oklch(0.2 0.01 65)` | Card text |
| `--primary` | `oklch(0.65 0.15 259)` | Primary actions, accents (premium blue) |
| `--primary-foreground` | `oklch(1 0 0)` | Text on primary (white) |
| `--secondary` | `oklch(0.72 0.18 259)` | Secondary actions (lighter blue) |
| `--secondary-foreground` | `oklch(1 0 0)` | Text on secondary |
| `--muted` | `oklch(0.94 0.002 0)` | Disabled states, backgrounds |
| `--muted-foreground` | `oklch(0.55 0.02 65)` | Muted text |
| `--accent` | `oklch(0.65 0.15 259)` | Highlights, focus states |
| `--accent-foreground` | `oklch(1 0 0)` | Text on accent |
| `--destructive` | `oklch(0.62 0.22 27)` | Errors, deletions (red) |
| `--destructive-foreground` | `oklch(1 0 0)` | Text on destructive |
| `--border` | `oklch(0.92 0.003 0)` | Subtle borders |
| `--input` | `oklch(0.96 0.001 0)` | Input backgrounds |

### Dark Theme

| Token | OKLCH Value | Usage |
|-------|-------------|-------|
| `--background` | `oklch(0.12 0.008 285)` | Page background (dark navy) |
| `--foreground` | `oklch(0.92 0.008 65)` | Primary text (light gray) |
| `--card` | `oklch(0.18 0.01 285)` | Card backgrounds (dark) |
| `--card-foreground` | `oklch(0.92 0.008 65)` | Card text |
| `--primary` | `oklch(0.65 0.15 259)` | Primary actions (bright blue) |
| `--primary-foreground` | `oklch(0.12 0.008 285)` | Text on primary |
| `--border` | `oklch(0.22 0.01 285)` | Subtle borders |

## Typography

### Font Stack

- **Display Font**: `Sora` (headings, titles)
  - Weights: 400, 600, 700
  - Used for: h1, h2, h3, h4, h5, h6
  - Characteristics: Modern, clean, premium feel

- **Body Font**: `Inter` (body text, UI)
  - Weights: 300, 400, 500, 600, 700
  - Used for: paragraphs, labels, buttons
  - Characteristics: Highly legible, neutral

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|-----------------|
| h1 | 2.25rem (36px) | 700 | 1.2 | -0.5px |
| h2 | 1.875rem (30px) | 700 | 1.2 | -0.5px |
| h3 | 1.5rem (24px) | 700 | 1.3 | -0.5px |
| h4 | 1.25rem (20px) | 600 | 1.3 | -0.3px |
| Body | 1rem (16px) | 400 | 1.5 | -0.3px |
| Small | 0.875rem (14px) | 400 | 1.4 | -0.2px |
| Caption | 0.75rem (12px) | 500 | 1.3 | 0px |

## Spacing System

All spacing follows a consistent 4px base unit scale:

| Token | Size | Usage |
|-------|------|-------|
| `space-1` | 4px | Tight spacing (icon padding) |
| `space-2` | 8px | Compact spacing (button padding) |
| `space-3` | 12px | Standard spacing (form gaps) |
| `space-4` | 16px | Default spacing (component padding) |
| `space-6` | 24px | Generous spacing (section gaps) |
| `space-8` | 32px | Large spacing (section padding) |
| `space-12` | 48px | Extra large spacing (page sections) |
| `space-16` | 64px | Massive spacing (hero sections) |

**Implementation**: Use Tailwind's `p-*`, `m-*`, `gap-*` utilities directly (e.g., `p-4` = 16px, `gap-6` = 24px).

## Border Radius

| Token | Size | Usage |
|-------|------|-------|
| `radius-sm` | 0.375rem (6px) | Small elements (badges, small buttons) |
| `radius-md` | 0.5rem (8px) | Medium elements (inputs, small cards) |
| `radius-lg` | 0.75rem (12px) | Large elements (cards, modals) |
| `radius-xl` | 1rem (16px) | Extra large (hero sections, large cards) |

**Default**: `--radius: 0.75rem` (12px) for most components.

## Shadows

### Premium Shadow System

| Class | Box Shadow | Usage |
|-------|-----------|-------|
| `.shadow-sm-premium` | `0 1px 2px rgba(0, 0, 0, 0.05)` | Subtle elevation (hover states) |
| `.shadow-md-premium` | `0 4px 12px rgba(0, 0, 0, 0.08)` | Standard cards, dropdowns |
| `.shadow-lg-premium` | `0 8px 24px rgba(0, 0, 0, 0.12)` | Elevated modals, popovers |
| `.shadow-xl-premium` | `0 12px 32px rgba(0, 0, 0, 0.15)` | Maximum elevation (dialogs) |

**Principle**: Shadows convey depth and hierarchy. Use sparingly for premium feel.

## Motion & Animation

### Timing

- **Fast**: 100–160ms (button press, quick feedback)
- **Standard**: 200–300ms (modal open, dropdown expand)
- **Slow**: 400–500ms (page transitions, complex animations)

### Easing Functions

- **Ease-out** (snappy, responsive): `cubic-bezier(0.23, 1, 0.32, 1)`
  - Used for: entering UI, button press, dropdown open
  - Feels: Responsive, energetic

- **Ease-in-out** (smooth, flowing): `cubic-bezier(0.77, 0, 0.175, 1)`
  - Used for: morphing, transitions between states
  - Feels: Smooth, natural

- **Never use ease-in**: Feels sluggish and unresponsive

### Common Animations

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Button press | 160ms | ease-out | `scale(0.97)` on `:active` |
| Dropdown open | 200ms | ease-out | Slide down + fade in |
| Modal appear | 300ms | ease-out | Scale from 0.95 + fade in |
| Hover state | 200ms | ease-out | Opacity/color change |
| Loading spinner | 1000ms | linear | Continuous rotation |

### Utility Classes

```css
.transition-smooth {
  transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
}
```

Use `.transition-smooth` for all interactive elements.

## Component Patterns

### Cards

- **Padding**: 24px (space-6)
- **Border Radius**: 12px (radius-lg)
- **Shadow**: `.shadow-md-premium`
- **Hover**: Increase shadow to `.shadow-lg-premium` with `.transition-smooth`
- **Background**: `bg-card text-card-foreground`

**Example**:
```tsx
<div className="card-premium p-6 rounded-lg shadow-md-premium transition-smooth hover:shadow-lg-premium">
  {/* Content */}
</div>
```

### Buttons

- **Padding**: 10px 16px (space-2 + space-4)
- **Border Radius**: 8px (radius-md)
- **Font Weight**: 600
- **Transition**: 160ms ease-out
- **Active State**: `scale(0.97)` transform

**Variants**:
- **Primary**: `bg-primary text-primary-foreground`
- **Secondary**: `bg-secondary text-secondary-foreground`
- **Outline**: `border border-primary text-primary`
- **Ghost**: `text-primary hover:bg-primary/10`

### Input Fields

- **Padding**: 12px 16px (space-3 + space-4)
- **Border Radius**: 8px (radius-md)
- **Border**: 1px solid `border`
- **Background**: `bg-input`
- **Focus**: `ring-2 ring-primary`
- **Transition**: 200ms ease-out

### Forms

- **Field Gap**: 16px (space-4)
- **Section Gap**: 24px (space-6)
- **Label Font Weight**: 500
- **Label Margin Bottom**: 8px (space-2)

## Glass Morphism

For premium overlays and backgrounds:

```css
.glass {
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.8); /* Light theme */
  /* Dark theme: rgba(15, 23, 42, 0.8) */
}
```

## Gradients

### Primary Gradient

```css
.gradient-primary {
  background: linear-gradient(to right, 
    oklch(0.65 0.15 259),    /* Primary blue */
    oklch(0.72 0.18 259)     /* Secondary blue */
  );
}
```

### Text Gradient

```css
.gradient-text {
  background: linear-gradient(to right, 
    oklch(0.65 0.15 259),
    oklch(0.72 0.18 259)
  );
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
}
```

## Responsive Design

### Breakpoints

| Breakpoint | Size | Device |
|-----------|------|--------|
| `sm` | 640px | Small tablet |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

### Mobile-First Approach

- Design for mobile first
- Use `md:` prefix for tablet and up
- Use `lg:` prefix for desktop and up
- Test on: iPhone SE, iPad, Desktop

### Container Queries

- **Mobile**: Full width with 16px padding
- **Tablet** (640px+): 24px padding
- **Desktop** (1024px+): 32px padding, max-width 1280px

## Accessibility

### Color Contrast

- **Text on background**: Minimum 4.5:1 contrast ratio (WCAG AA)
- **Large text** (18px+): Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio

### Focus States

- **All interactive elements** must have visible focus ring
- **Focus ring**: 2px solid `ring` color
- **Focus ring offset**: 2px

### Keyboard Navigation

- **Tab order**: Logical, left-to-right, top-to-bottom
- **Escape key**: Close modals, popovers, dropdowns
- **Enter key**: Submit forms, activate buttons
- **Arrow keys**: Navigate lists, tabs, sliders

## Implementation Checklist

When building components:

- [ ] Use semantic HTML (`<button>`, `<input>`, `<label>`, etc.)
- [ ] Apply correct spacing from spacing system
- [ ] Use premium shadows (not default Tailwind)
- [ ] Add smooth transitions (200–300ms)
- [ ] Ensure 4.5:1 contrast ratio
- [ ] Include focus ring on interactive elements
- [ ] Test on mobile, tablet, desktop
- [ ] Verify dark mode appearance
- [ ] Use Sora for headings, Inter for body
- [ ] Follow button and card patterns

## Premium Feel Principles

1. **Subtle, not loud**: Use soft shadows, gentle colors, minimal borders
2. **Generous spacing**: Don't crowd elements; let them breathe
3. **Smooth motion**: Every interaction should feel responsive and polished
4. **Consistent typography**: Hierarchy is clear but not jarring
5. **Accessibility first**: Premium design includes everyone
6. **Dark mode ready**: Every color should work in both themes
7. **Attention to detail**: Hover states, focus rings, loading states all matter
8. **Performance**: Animations should not cause jank or lag

## References

- **Color System**: OKLCH color space (perceptually uniform, better than HSL)
- **Typography**: Google Fonts (Sora, Inter)
- **Animation**: Framer Motion guidelines
- **Accessibility**: WCAG 2.1 AA standard
- **Responsive**: Mobile-first, Tailwind CSS breakpoints
