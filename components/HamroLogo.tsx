import React from 'react';

interface HamroLogoProps {
  className?: string;
  size?: number;
}

/**
 * Hamro AI Brand Logo
 * A minimalist, geometric representation of Himalayan peaks.
 * Designed to fit the Notion-style clean aesthetic.
 */
const HamroLogo: React.FC<HamroLogoProps> = ({ className = "w-6 h-6", size }) => {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      style={size ? { width: size, height: size } : {}}
    >
      {/* Right Peak (Secondary) */}
      <path 
        d="M14 10L22 22H10L14 10Z" 
        fill="currentColor" 
        fillOpacity="0.3" 
      />
      {/* Left Peak (Secondary) */}
      <path 
        d="M6 12L12 22H2L6 12Z" 
        fill="currentColor" 
        fillOpacity="0.5" 
      />
      {/* Center Peak (Primary) */}
      <path 
        d="M10.5 4L18 22H3L10.5 4Z" 
        fill="currentColor" 
      />
      {/* Summit Detail - The "Light" of AI */}
      <path 
        d="M10.5 4L12.5 9H8.5L10.5 4Z" 
        fill="white" 
        fillOpacity="0.8"
      />
    </svg>
  );
};

export default HamroLogo;