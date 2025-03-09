# SimpleIcon Component

A lightweight, customizable icon component for displaying SVG icons in your React application.

## Features

- Built-in SVG icons for common use cases
- Consistent styling and sizing
- Customizable colors
- Fallback icon for undefined icons
- TypeScript support with proper typing

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

### With Custom Colors

```tsx
// Using a custom color
<SimpleIcon name="github" size={24} color="#333333" />

// Using theme colors with currentColor
<SimpleIcon name="mail" size={20} color="currentColor" />
```

### With Custom Classes

```tsx
// Adding custom classes for additional styling
<SimpleIcon 
  name="linkedin" 
  size={24} 
  className="hover:opacity-80 transition-opacity" 
/>
```

## Available Icons

### UI Icons

- `globe` - Globe/world icon for websites
- `link` - Link/chain icon for URLs
- `mail` - Email/envelope icon
- `email` - Alternative email icon (same as mail)
- `image` - Image/photo icon
- `x` - Close/X icon
- `arrowright` - Right arrow icon
- `arrowleft` - Left arrow icon
- `briefcase` - Briefcase/work icon

### Brand Icons

- `github` - GitHub logo
- `linkedin` - LinkedIn logo

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `string` | (required) | Name of the icon to display |
| `size` | `number` | `24` | Size of the icon in pixels |
| `color` | `string` | Brand color or currentColor | Color of the icon (hex, rgb, etc.) |
| `className` | `string` | `''` | Additional CSS classes |

## Default Brand Colors

The component includes default brand colors for common icons:

- GitHub: `#181717`
- LinkedIn: `#0A66C2`
- Email/Mail: `#EA4335`

## Implementation Details

The SimpleIcon component uses a simple approach:

1. It maintains a dictionary of custom SVG icons
2. It applies the appropriate brand color or custom color
3. It provides a fallback icon (plus sign) for undefined icons

## Adding New Icons

To add a new icon, update the `customIcons` object in the SimpleIcon component:

```tsx
// Add a new custom icon
const customIcons: Record<string, React.ReactNode> = {
  // ... existing icons
  
  newIcon: (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* SVG path data */}
    </svg>
  ),
};
```

Also add the brand color if applicable:

```tsx
const brandColors: Record<string, string> = {
  // ... existing colors
  newIcon: '#FF0000',
};
``` 