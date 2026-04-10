import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { optimizedUrl } from "@/lib/imageProxy";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  /** Desired display width for imgproxy resizing (default: 400) */
  proxyWidth?: number;
}

export const OptimizedImage = ({
  className,
  fallback,
  onLoad,
  onError,
  alt,
  src,
  proxyWidth = 400,
  ...props
}: OptimizedImageProps) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  if (error && fallback) return <>{fallback}</>;

  return (
    <img
      {...props}
      src={optimizedUrl(src, proxyWidth)}
      alt={alt}
      loading="lazy"
      decoding="async"
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      onError={(e) => {
        setError(true);
        onError?.(e);
      }}
      className={cn(
        "transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0",
        className,
      )}
    />
  );
};
