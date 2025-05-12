import React from 'react';

const Logo: React.FC = () => {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-10 h-10"
    >
      {/* Book shape */}
      <path
        d="M40 40L40 160C40 160 80 140 100 140C120 140 160 160 160 160L160 40C160 40 120 20 100 20C80 20 40 40 40 40Z"
        fill="#006400"
        stroke="#8B4513"
        strokeWidth="4"
      />
      
      {/* Left page - Yorùbá symbol */}
      <path
        d="M65 70C65 70 80 100 100 100C120 100 135 70 135 70M65 130C65 130 80 100 100 100C120 100 135 130 135 130M100 70V130M82.5 85H117.5M82.5 115H117.5"
        stroke="#FFD700"
        strokeWidth="3"
        fill="none"
      />
      
      {/* Right page - African symbol */}
      <path
        d="M100 100C110 100 115 95 115 85C115 75 110 70 100 70C90 70 85 75 85 85C85 95 90 100 100 100Z"
        fill="#FFD700"
      />
      
      {/* Book top */}
      <path
        d="M40 40C40 40 55 30 70 25C85 20 100 20 100 20C100 20 115 20 130 25C145 30 160 40 160 40"
        stroke="#8B4513"
        strokeWidth="4"
        fill="#FFD700"
      />
      
      {/* Book bottom */}
      <path
        d="M40 160C40 160 55 170 70 175C85 180 100 180 100 180C100 180 115 180 130 175C145 170 160 160 160 160"
        stroke="#8B4513"
        strokeWidth="4"
        fill="#8B4513"
      />
    </svg>
  );
};

export default Logo;
