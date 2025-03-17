import React from "react";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

const AtomIcon: React.FC<IconProps> = ({ size = 24, color = "currentColor", strokeWidth = 2 }) => {
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
      <circle cx="12" cy="12" r="1" />
      <path d="M20.2 20.2c2.04-2.03 2.77-4.86 2.77-8.2 0-3.34-.73-6.17-2.77-8.2-2.03-2.04-4.86-2.77-8.2-2.77-3.34 0-6.17.73-8.2 2.77-2.04 2.03-2.77 4.86-2.77 8.2 0 3.34.73 6.17 2.77 8.2 2.03 2.04 4.86 2.77 8.2 2.77 3.34 0 6.17-.73 8.2-2.77" />
      <path d="M12 12c-3.34 0-6.17.73-8.2 2.77C1.76 16.8 1.03 19.63 1.03 23" />
      <path d="M12 12c0-3.34.73-6.17 2.77-8.2C16.8 1.76 19.63 1.03 23 1.03" />
      <path d="M12 12c3.34 0 6.17.73 8.2 2.77 2.04 2.03 2.77 4.86 2.77 8.2" />
      <path d="M12 12c0 3.34-.73 6.17-2.77 8.2-2.03 2.04-4.86 2.77-8.2 2.77" />
    </svg>
  );
};

export default AtomIcon;
