export interface BrandChipProps {
  name: string;
  /** 20px-tall logo; the name in overline when absent. */
  logo?: string;
}

export function BrandChip({ name, logo }: BrandChipProps) {
  return (
    <span className="fv-brand-chip" title={name}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- brand logos are tiny and vary in aspect ratio
        <img src={logo} alt={name || ""} style={{ height: 20 }} />
      ) : (
        String(name || "").toUpperCase()
      )}
    </span>
  );
}
