interface CS2LogoProps {
  size?: number;
  className?: string;
}

export default function CS2Logo({ size = 40, className = "" }: CS2LogoProps) {
  return (
    <img
      src="/images/cs2-logo.png"
      alt="CS2 Logo"
      width={size}
      height={size}
      className={className}
      style={{ objectFit: "contain" }}
    />
  );
}
