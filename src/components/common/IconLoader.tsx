// IconLoader.tsx
import React from "react";

type IconImageProps = {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
  width?: number;
  height?: number;
  alt?: string;
};

const IconLoader: React.FC<IconImageProps> = ({
  iconName,
  className,
  style,
  width = 24,
  height = 24,
  alt = iconName,
}) => {
  const iconSrc = new URL(`../../assets/icons/${iconName}.svg`, import.meta.url)
    .href;

  return (
    <img
      src={iconSrc}
      className={className}
      style={style}
      width={width}
      height={height}
      alt={alt}
      loading="lazy"
    />
  );
};

export default IconLoader;
