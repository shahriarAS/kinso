# Consistent Rounded Corners Design System

This document outlines the consistent rounded corner system implemented across the Kinso application.

## Border Radius Scale

We use a consistent scale of border radius values defined in CSS custom properties:

- **--radius-xs (4px)**: Small elements like badges, chips, tags
- **--radius-sm (6px)**: Buttons, form inputs, selects
- **--radius-md (8px)**: Cards, dropdowns, modals, alerts
- **--radius-lg (12px)**: Larger cards, containers, sections
- **--radius-xl (16px)**: Large containers, panels
- **--radius-2xl (24px)**: Drawers, large modals
- **--radius-full (9999px)**: Fully rounded elements (avatars, pills)

## Implementation

### 1. CSS Custom Properties
The border radius values are defined in `/app/globals.css`:

```css
:root {
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-2xl: 24px;
  --radius-full: 9999px;
}
```

### 2. Tailwind Configuration
Tailwind CSS classes are extended in `/tailwind.config.js` to use these consistent values:

```javascript
borderRadius: {
  'xs': 'var(--radius-xs)',
  'sm': 'var(--radius-sm)', 
  'md': 'var(--radius-md)',
  'lg': 'var(--radius-lg)',
  'xl': 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
  'full': 'var(--radius-full)',
}
```

### 3. Ant Design Components
Ant Design components are styled globally to use consistent border radius:

```css
.ant-btn-primary,
.ant-btn-default {
  border-radius: var(--radius-sm);
}

.ant-input,
.ant-select-selector,
.ant-picker {
  border-radius: var(--radius-sm) !important;
}

.ant-modal-content,
.ant-dropdown-menu {
  border-radius: var(--radius-md) !important;
}

.ant-card {
  border-radius: var(--radius-lg) !important;
}
```

## Usage Guidelines

### Component-Specific Recommendations

| Component Type | Recommended Class | Size | Use Case |
|----------------|------------------|------|----------|
| Buttons | `rounded-sm` | 6px | All button elements |
| Form Inputs | `rounded-sm` | 6px | Input, Select, TextArea |
| Cards | `rounded-lg` | 12px | Content cards, containers |
| Modals | `rounded-md` | 8px | Dialog boxes, popups |
| Badges/Tags | `rounded-xs` | 4px | Small status indicators |
| Avatars | `rounded-full` | Full | Profile pictures, icons |
| Drawers | `rounded-2xl` | 24px | Side panels |

### Examples

```tsx
// Buttons
<Button className="rounded-sm">Click me</Button>

// Cards
<div className="bg-white rounded-lg shadow-lg p-6">
  Card content
</div>

// Form inputs
<Input className="rounded-sm" placeholder="Enter text" />

// Badges
<span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-xs text-xs">
  Badge
</span>

// Using the utility library
import { getRoundedClass, ROUNDED_CLASSES } from '@/lib/borderRadius';

<div className={getRoundedClass('card')}>Content</div>
```

## Migration Guide

When updating existing components:

1. **Replace inconsistent values**:
   - `rounded-2xl` → `rounded-xl` (for large containers)
   - `rounded-3xl` → `rounded-2xl` (for drawers)
   - `rounded` → `rounded-xs` (for small elements)

2. **Use utility functions**:
   ```tsx
   import { getRoundedClass } from '@/lib/borderRadius';
   
   // Instead of hardcoding classes
   <div className="rounded-lg">
   
   // Use the utility
   <div className={getRoundedClass('card')}>
   ```

3. **Update Ant Design overrides**:
   - Remove custom `border-radius` styles
   - Let global styles handle consistency

## Benefits

1. **Visual Consistency**: All components use the same border radius scale
2. **Maintainability**: Easy to update globally by changing CSS custom properties
3. **Developer Experience**: Clear guidelines and utilities for implementation
4. **Performance**: Consistent values enable better CSS optimization

## Files Updated

- `/app/globals.css` - Global styles and CSS custom properties
- `/tailwind.config.js` - Tailwind CSS configuration
- `/lib/borderRadius.ts` - Utility functions and constants
- Component files - Updated to use consistent classes

Remember to always use the defined scale rather than arbitrary values to maintain consistency across the application.
