import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const CircleIcon: React.FC<IconProps> = ({ 
  size = 24, 
  color = 'currentColor',
  strokeWidth = 2
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={color} 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
    </svg>
  );
};

export default CircleIcon; 