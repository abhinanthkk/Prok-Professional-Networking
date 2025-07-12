import React from 'react';

interface DefaultAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const DefaultAvatar: React.FC<DefaultAvatarProps> = ({ name, size = 'md', className = '' }) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base'
  };

  const baseClasses = 'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center border border-gray-200';

  return (
    <div className={`${baseClasses} ${sizeClasses[size]} ${className}`}>
      {getInitials(name)}
    </div>
  );
};

export default DefaultAvatar; 