import React, { useState, useRef, useEffect, memo } from 'react';
import { Loader2 } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  lazy?: boolean;
  quality?: number;
  width?: number;
  height?: number;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

// Image optimization utility
const optimizeImageUrl = (src: string, options: { quality?: number; width?: number; height?: number } = {}) => {
  if (!src) return src;
  
  // If it's a base64 data URL, return as-is
  if (src.startsWith('data:')) {
    return src;
  }
  
  // If it's an external URL, try to optimize with image service
  if (src.startsWith('http')) {
    const url = new URL(src);
    
    // Add optimization parameters for common image services
    if (url.hostname.includes('unsplash.com')) {
      url.searchParams.set('w', (options.width || 400).toString());
      url.searchParams.set('q', (options.quality || 80).toString());
    } else if (url.hostname.includes('images.unsplash.com')) {
      url.searchParams.set('w', (options.width || 400).toString());
      url.searchParams.set('q', (options.quality || 80).toString());
    }
    
    return url.toString();
  }
  
  return src;
};

// Intersection Observer hook for lazy loading
const useIntersectionObserver = (
  ref: React.RefObject<HTMLElement>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = '',
  fallbackSrc = '/placeholder-image.jpg',
  lazy = true,
  quality = 80,
  width = 400,
  height = 300,
  placeholder,
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const isIntersecting = useIntersectionObserver(containerRef, { threshold: 0.1 });

  // Optimize image URL
  const optimizedSrc = optimizeImageUrl(src, { quality, width, height });

  // Load image when intersecting (lazy loading)
  useEffect(() => {
    if (!lazy || isIntersecting) {
      setCurrentSrc(optimizedSrc);
    }
  }, [lazy, isIntersecting, optimizedSrc]);

  // Handle image load
  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  // Handle image error
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    
    // Try fallback if not already using it
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      onError?.();
    }
  };

  // Show placeholder while loading
  if (isLoading && !currentSrc) {
    return (
      <div 
        ref={containerRef}
        className={`bg-muted animate-pulse flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        {placeholder ? (
          <img 
            src={placeholder} 
            alt="Loading..." 
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      
      {/* Error state */}
      {hasError && currentSrc === fallbackSrc && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="w-12 h-12 bg-muted-foreground/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <span className="text-xs">📷</span>
            </div>
            <p className="text-xs">Image not available</p>
          </div>
        </div>
      )}
      
      {/* Actual image */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
        />
      )}
    </div>
  );
});

// Preload images utility
export const preloadImages = (urls: string[]) => {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
};

// Image compression utility (for base64 images)
export const compressImage = (
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 600,
  quality: number = 0.8
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      ctx?.drawImage(img, 0, 0, width, height);
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export default OptimizedImage;
