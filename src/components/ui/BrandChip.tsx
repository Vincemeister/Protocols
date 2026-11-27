export interface BrandChipProps {
  name: string;
  /** 20px-tall logo. Shown with the name beside it: most logos found on a product's page are icons, which need the name to be read. (The design system shows the logo alone; fold this in at the next re-export.) */
  logo?: string;
}

export function BrandChip({ name, logo }: BrandChipProps) {
  return (
    <span className="fv-brand-chip" title={name}>
      {logo ? (
        // eslint-disable-next-line @next/next/no-img-element -- brand logos are tiny and vary in aspect ratio
        <img src={logo} alt="" style={{ height: 20, maxWidth: 64, objectFit: "contain", marginRight: name ? "var(--space-2)" : 0 }} />
      ) : null}
      {String(name || "").toUpperCase()}
    </span>
  );
}
