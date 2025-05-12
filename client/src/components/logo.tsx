import React from 'react';
import yorubaLogoPath from '../assets/yoruba-logo.png';

const Logo: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const sizeClass = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20',
  }[size];

  return (
    <img 
      src={yorubaLogoPath} 
      alt="Aprendendo Yorùbá Logo" 
      className={`${sizeClass} object-contain`}
    />
  );
};

export default Logo;
