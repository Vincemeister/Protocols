import { notFound } from "next/navigation";
import { PREVIEWS } from "../../previews";
import "../../dev.css";

// One preview on a bare page in one theme: the page the comparison script
// screenshots against design-system/components/<Name>/preview.html.
export function generateStaticParams() {
  return PREVIEWS.flatMap((p) => [
    { name: p.name, theme: "light" },
    { name: p.name, theme: "dark" },
  ]);
}

export default async function SoloPreview({ params }: { params: Promise<{ name: string; theme: string }> }) {
  const { name, theme } = await params;
  const preview = PREVIEWS.find((p) => p.name === name);
  if (!preview || (theme !== "light" && theme !== "dark")) notFound();
  return (
    <div data-theme={theme} className="dev-solo">
      {preview.render()}
    </div>
  );
}
