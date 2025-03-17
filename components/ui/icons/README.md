# SimpleIcon Component

A lightweight, customizable icon component for displaying SVG icons in your React application.

## Features

- Built-in SVG icons for common use cases
- **Simple static imports for better maintainability**
- Consistent styling and sizing
- Customizable colors with brand defaults
- **Dark mode support with separate color schemes**
- Fallback icon for undefined icons
- TypeScript support with proper typing
- **Improved accessibility with aria-hidden support**

## Usage

### Basic Usage

```tsx
import { SimpleIcon } from '@/components/ui/icons/SimpleIcon';

// Social media icons
<SimpleIcon name="github" size={24} />
<SimpleIcon name="linkedin" size={24} />

// UI icons
<SimpleIcon name="mail" size={24} />
<SimpleIcon name="globe" size={24} />
<SimpleIcon name="link" size={24} />
```

### With Dark Mode Support

```tsx
// Using automatic dark mode detection
<SimpleIcon
  name="github"
  size={24}
  color="#333333"
  darkModeColor="#ffffff"
/>

// Using theme colors with currentColor
<SimpleIcon name="mail" size={20} color="currentColor" />
```

### With Accessibility Support

```tsx
// Decorative icon (hidden from screen readers)
<SimpleIcon name="github" size={24} ariaHidden={true} />

// Meaningful icon (in accessible elements)
<button aria-label="Send email">
  <SimpleIcon name="mail" size={20} />
</button>
```

### With Custom Classes

```tsx
// Adding custom classes for additional styling
<SimpleIcon name="linkedin" size={24} className="transition-opacity hover:opacity-80" />
```

## How It Works

The SimpleIcon component uses an efficient modular approach:

1. Each icon is defined in its own file in the `icons` directory
2. All icon components are statically imported at the top of SimpleIcon.tsx
3. A mapping connects icon names to their respective components
4. The system automatically handles dark mode using CSS variables and Tailwind's dark mode utilities
5. When you use `<SimpleIcon name="github" />`, it renders the appropriate component

## Benefits for Applications

This implementation provides several benefits:

- **Modularity**: Each icon lives in its own file
- **Maintainability**: Easy to add, remove, or update icons
- **Dark Mode Support**: Icons look great in both light and dark themes
- **Accessibility**: Proper aria-hidden support for decorative icons
- **Consistency**: All icons share the same API and behavior
- **Predictability**: All icons are loaded upfront, no loading states to manage
- **Bundle Control**: You explicitly control which icons are included

## Available Icons

### UI Icons

- `globe` - Globe/world icon for websites
- `mail` - Email/envelope icon
- `check` - Checkmark icon
- `arrowright` - Right arrow icon

### Brand Icons

- `github` - GitHub logo

## Props

| Prop            | Type      | Default                          | Description                                  |
| --------------- | --------- | -------------------------------- | -------------------------------------------- |
| `name`          | `string`  | (required)                       | Name of the icon to display                  |
| `size`          | `number`  | `24`                             | Size of the icon in pixels                   |
| `color`         | `string`  | Brand color or currentColor      | Color of the icon in light mode              |
| `darkModeColor` | `string`  | Dark brand color or currentColor | Color of the icon in dark mode               |
| `className`     | `string`  | `''`                             | Additional CSS classes                       |
| `strokeWidth`   | `number`  | `2`                              | Width of strokes for outline icons           |
| `ariaHidden`    | `boolean` | `undefined`                      | Whether to hide the icon from screen readers |

## Default Brand Colors

The component includes default brand colors for common icons:

### Light Mode

- GitHub: `#181717`
- LinkedIn: `#0A66C2`
- Email/Mail: `#EA4335`

### Dark Mode

- GitHub: `#f0f6fc`
- LinkedIn: `#0A66C2` (works in both modes)
- Email/Mail: `#EA4335` (works in both modes)

## Adding New Icons

To add a new icon:

1. Create a new icon component in the `icons` directory
2. Import it in `SimpleIcon.tsx`
3. Add it to the `iconComponents` mapping

```tsx
// 1. Create the icon component (e.g., icons/NewIcon.tsx)
// 2. Import it in SimpleIcon.tsx
import NewIcon from "./icons/NewIcon";

// 3. Add it to the iconComponents mapping
const iconComponents = {
  // ... existing icons
  newicon: NewIcon,
};
```

## When to Consider Dynamic Imports

While this static approach is ideal for smaller applications, consider switching to dynamic imports if:

1. Your icon library grows to more than 20-30 icons
2. You notice your bundle size increasing significantly
3. Most pages only use a small subset of all available icons
4. You're building a large application with many routes

## Accessibility

When using icons that convey meaning, always include appropriate accessibility attributes:

```tsx
<button aria-label="Close dialog">
  <SimpleIcon name="x" size={16} />
</button>
```

For decorative icons, use `aria-hidden="true"` to hide them from screen readers:

```tsx
<div className="flex items-center">
  <SimpleIcon name="check" size={16} ariaHidden={true} />
  <span>Task completed</span>
</div>
```
