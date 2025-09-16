import React from 'react';

type TextEllipsisProps = {
  children: React.ReactNode;
  /** number of lines to show before truncating with ellipsis. Default: 1 (single-line) */
  lines?: number;
  /** set the title attribute to show full text on hover. Pass string to override. Default: true */
  title?: boolean | string;
  /** custom element tag. Default: 'span' */
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: React.CSSProperties;
  /** ensure ellipsis works inside flex by applying min-width: 0. Default: true */
  minWidthZero?: boolean;
  /** fixed width for the ellipsis container (number in px or any CSS length) */
  width?: number | string;
  /** max-width for the ellipsis container (number in px or any CSS length) */
  maxWidth?: number | string;
};

const toCssSize = (v?: number | string) =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v;

const TextEllipsis: React.FC<TextEllipsisProps> = ({
  children,
  lines = 1,
  title = true,
  as: Tag = 'span',
  className = '',
  style = {},
  minWidthZero = true,
  width,
  maxWidth,
}) => {
  const isMultiLine = lines > 1;

  const baseStyle: React.CSSProperties = isMultiLine
    ? {
        display: '-webkit-box',
        WebkitLineClamp: lines as any,
        WebkitBoxOrient: 'vertical' as any,
        overflow: 'hidden',
      }
    : {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        display: 'inline-block',
      };

  const dimensionStyle: React.CSSProperties = {
    ...(width !== undefined ? { width: toCssSize(width) } : { width: '100%' }),
    ...(maxWidth !== undefined ? { maxWidth: toCssSize(maxWidth) } : {}),
  };

  const titleValue =
    typeof title === 'string'
      ? title
      : title
      ? (typeof children === 'string' ? children : undefined) as any
      : undefined;

  return (
    <Tag
      className={className}
      style={{ ...(minWidthZero ? { minWidth: 0 } : {}), ...baseStyle, ...dimensionStyle, ...style }}
      title={titleValue}
    >
      {children}
    </Tag>
  );
};

export default TextEllipsis; 