import Image from "next/image";

// Sizes from `_avatar.scss` in Favolist 4.0. The profile header uses xl.
const SIZES = { xs: 24, sm: 32, md: 40, lg: 56, xl: 72, xxl: 144 } as const;

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
  // `.avatar-bordered`: 1px white edge and a soft shadow
  const frame = "shrink-0 rounded-full border border-white shadow-[0_1px_2px_rgba(0,0,0,0.2)]";

  if (!src) {
    return (
      <span
        aria-hidden
        className={`${frame} grid place-items-center bg-primary-100 font-semibold text-primary-700`}
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
      className={`${frame} object-cover`}
      style={{ width: px, height: px }}
    />
  );
}
