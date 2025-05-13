
import React from 'react';
import yorubaLogoPath from '../assets/yoruba-logo.png';

const Logo: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ size = 'medium' }) => {
  const sizeClass = {
    small: 'w-10 h-10',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
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
