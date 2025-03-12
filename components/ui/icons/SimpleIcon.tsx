import React from 'react';
// Import all icon components
import ArrowrightIcon from './icons/ArrowrightIcon';
import ArrowleftIcon from './icons/ArrowleftIcon';
import CheckIcon from './icons/CheckIcon';
import GithubIcon from './icons/GithubIcon';
import GlobeIcon from './icons/GlobeIcon';
import MailIcon from './icons/MailIcon';
import EditIcon from './icons/EditIcon';
import LayersIcon from './icons/LayersIcon';
import UsersIcon from './icons/UsersIcon';
import AtomIcon from './icons/AtomIcon';
import InfoIcon from './icons/InfoIcon';
import LoaderIcon from './icons/LoaderIcon';
import AlertCircleIcon from './icons/AlertCircleIcon';
import XIcon from './icons/XIcon';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';
import ChevronLeftIcon from './icons/ChevronLeftIcon';
import ChevronRightIcon from './icons/ChevronRightIcon';
import CircleIcon from './icons/CircleIcon';
import PlusCircleIcon from './icons/PlusCircleIcon';
import FileIcon from './icons/FileIcon';
import HomeIcon from './icons/HomeIcon';
import MenuIcon from './icons/MenuIcon';
import DollarSignIcon from './icons/DollarSignIcon';
import LinkIcon from './icons/LinkIcon';
import ExternalLinkIcon from './icons/ExternalLinkIcon';
import ClockIcon from './icons/ClockIcon';
import SparklesIcon from './icons/SparklesIcon';
import SettingsIcon from './icons/SettingsIcon';
import BookIcon from './icons/BookIcon';
import MoreHorizontalIcon from './icons/MoreHorizontalIcon';
import Trash2Icon from './icons/Trash2Icon';
import CalendarIcon from './icons/CalendarIcon';
import ImageIcon from './icons/ImageIcon';
import AlertTriangleIcon from './icons/AlertTriangleIcon';
import RefreshCwIcon from './icons/RefreshCwIcon';
import SearchIcon from './icons/SearchIcon';
import BellIcon from './icons/BellIcon';
import LockIcon from './icons/LockIcon';
import UserIcon from './icons/UserIcon';

// Add more imports as needed for other icons

interface SimpleIconProps {
  name: string;
  size?: number;
  color?: string;
  darkModeColor?: string;
  className?: string;
  strokeWidth?: number;
  ariaHidden?: boolean;
}

// Map of icon names to their components
const iconComponents: Record<string, React.FC<any>> = {
  arrowright: ArrowrightIcon,
  arrowleft: ArrowleftIcon,
  check: CheckIcon,
  github: GithubIcon,
  globe: GlobeIcon,
  mail: MailIcon,
  edit: EditIcon,
  layers: LayersIcon,
  users: UsersIcon,
  atom: AtomIcon,
  info: InfoIcon,
  loader: LoaderIcon,
  alertcircle: AlertCircleIcon,
  x: XIcon,
  chevrondown: ChevronDownIcon,
  chevronup: ChevronUpIcon,
  chevronleft: ChevronLeftIcon,
  chevronright: ChevronRightIcon,
  circle: CircleIcon,
  pluscircle: PlusCircleIcon,
  file: FileIcon,
  home: HomeIcon,
  menu: MenuIcon,
  dollarsign: DollarSignIcon,
  link: LinkIcon,
  externallink: ExternalLinkIcon,
  clock: ClockIcon,
  sparkles: SparklesIcon,
  settings: SettingsIcon,
  book: BookIcon,
  morehorizontal: MoreHorizontalIcon,
  trash2: Trash2Icon,
  calendar: CalendarIcon,
  image: ImageIcon,
  alerttriangle: AlertTriangleIcon,
  refreshcw: RefreshCwIcon,
  search: SearchIcon,
  bell: BellIcon,
  lock: LockIcon,
  user: UserIcon,
  // Add more mappings as needed
};

// Brand colors for common icons (light mode)
const brandColors: Record<string, string> = {
  github: '#181717',
  linkedin: '#0A66C2',
  email: '#EA4335',
  mail: '#EA4335',
  link: '#000000',
};

// Brand colors for dark mode
const darkModeBrandColors: Record<string, string> = {
  github: '#f0f6fc',
  linkedin: '#0A66C2', // LinkedIn blue works in both modes
  email: '#EA4335', // Google red works in both modes
  mail: '#EA4335',
  link: '#ffffff',
};

/**
 * SimpleIcon component that renders SVG icons from a centralized system
 * with support for dark mode
 * 
 * @param name - The slug of the icon (github, linkedin, mail, globe, etc.)
 * @param size - The size of the icon in pixels (default: 24)
 * @param color - Optional color override for light mode (default: brand color or currentColor)
 * @param darkModeColor - Optional color override for dark mode
 * @param className - Optional additional CSS classes
 * @param strokeWidth - Optional stroke width for outline icons (default: 2)
 * @param ariaHidden - Whether the icon should be hidden from screen readers
 */
export function SimpleIcon({ 
  name, 
  size = 24, 
  color,
  darkModeColor,
  className = '',
  strokeWidth = 2,
  ariaHidden
}: SimpleIconProps) {
  // Get the icon component
  const IconComponent = iconComponents[name];
  
  // Container styles
  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
  };

  // Accessibility props
  const a11yProps = ariaHidden !== undefined ? { 'aria-hidden': ariaHidden } : {};

  // Determine the color to use (custom color, brand color, or currentColor)
  const lightColor = color || brandColors[name] || 'currentColor';
  const darkColor = darkModeColor || darkModeBrandColors[name] || 'currentColor';

  // Render the icon component if it exists, otherwise render a fallback
  return (
    <div 
      className={`inline-flex items-center justify-center ${className}`}
      style={containerStyle}
      {...a11yProps}
    >
      {IconComponent ? (
        <span className="text-[--icon-color] dark:text-[--icon-dark-color]" style={{
          '--icon-color': lightColor,
          '--icon-dark-color': darkColor
        } as React.CSSProperties}>
          <IconComponent 
            size={size} 
            color="currentColor" 
            strokeWidth={strokeWidth} 
          />
        </span>
      ) : (
        // Fallback icon (plus sign in a circle)
        <span className="text-[--icon-color] dark:text-[--icon-dark-color]" style={{
          '--icon-color': lightColor,
          '--icon-dark-color': darkColor
        } as React.CSSProperties}>
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth={strokeWidth} 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </span>
      )}
    </div>
  );
}

/**
 * Simplified helper to convert a color to CSS filter
 */
function colorToFilter(color: string): string {
  return `opacity(0.75)`;
}
