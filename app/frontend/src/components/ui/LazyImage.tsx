import React from 'react';
import { useLazyImage } from '../../hooks/useLazyImage';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  threshold?: number;
  rootMargin?: string;
  onClick?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder,
  threshold,
  rootMargin,
  onClick
}) => {
  const { imageSrc, isLoaded, imgRef } = useLazyImage({
    src,
    alt,
    placeholder,
    threshold,
    rootMargin,
  });

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={`transition-opacity duration-300 ${
        isLoaded ? 'opacity-100' : 'opacity-60'
      } ${className}`}
      onClick={onClick}
      loading="lazy"
    />
  );
};

export default LazyImage; 