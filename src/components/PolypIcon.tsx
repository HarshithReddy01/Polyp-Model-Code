import React from 'react';

interface PolypIconProps {
  size?: number;
  className?: string;
}

const PolypIcon: React.FC<PolypIconProps> = ({ size = 80, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="40" cy="40" r="38" fill="#2563eb" opacity="0.15" />
      <circle cx="40" cy="40" r="30" fill="#2563eb" opacity="0.25" />
      <circle cx="40" cy="40" r="20" fill="#2563eb" />
      <path
        d="M28 40 Q34 28 40 32 Q46 28 52 40 Q46 52 40 48 Q34 52 28 40Z"
        fill="white"
        opacity="0.9"
      />
      <circle cx="40" cy="40" r="5" fill="#1d4ed8" />
    </svg>
  );
};

export default PolypIcon;
