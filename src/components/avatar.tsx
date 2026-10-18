import Image from "next/image";

// Figma avatar sizes: XSmall 24, Medium 40, XXLarge 64. The profile header
// uses a larger 96 since it's the hero of a link-in-bio page.
const SIZES = { xs: 24, md: 40, xl: 64, hero: 96 } as const;

export function Avatar({
  src,
  name,
  size = "md",
  priority = false,
}: {
  src: string | null;
  name: string;
  size?: keyof typeof SIZES;
  priority?: boolean;
}) {
  const px = SIZES[size];

  if (!src) {
    return (
      <span
        aria-hidden
        className="grid shrink-0 place-items-center rounded-full bg-accent font-semibold text-white"
        style={{ width: px, height: px, fontSize: px * 0.4 }}
      >
        {name.charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      width={px}
      height={px}
      priority={priority}
      className="shrink-0 rounded-full border-[1.5px] border-white object-cover shadow-sm"
      style={{ width: px, height: px }}
    />
  );
}
