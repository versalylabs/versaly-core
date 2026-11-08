/* eslint-disable @next/next/no-img-element */

/** The Versaly app icon (glass "V" on the aurora tile), at any size. */
export function BrandMark({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <img
      src="/icon.svg"
      width={size}
      height={size}
      alt="Versaly"
      draggable={false}
      className={className}
      style={{ width: size, height: size }}
    />
  );
}
