import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const SparklesIcon: React.FC<IconProps> = ({ 
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
      <path d="M12 3v18"></path>
      <path d="M16.25 7.75 7.75 16.25"></path>
      <path d="m19 5-7 7"></path>
      <path d="m5 19 7-7"></path>
      <path d="M16.75 12.25 21 17"></path>
      <path d="m3 7 4.25 4.75"></path>
    </svg>
  );
};

export default SparklesIcon; 