import { notFound } from "next/navigation";
import { SCREENS } from "../../screens";

// One creator screen on a bare page in one theme, for looking at and for screenshots.
export function generateStaticParams() {
  return SCREENS.flatMap((s) => [
    { name: s.name, theme: "light" },
    { name: s.name, theme: "dark" },
  ]);
}

export default async function SoloScreen({ params }: { params: Promise<{ name: string; theme: string }> }) {
  const { name, theme } = await params;
  const screen = SCREENS.find((s) => s.name === name);
  if (!screen || (theme !== "light" && theme !== "dark")) notFound();
  return <div data-theme={theme}>{screen.render()}</div>;
}
