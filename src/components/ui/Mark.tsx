/* eslint-disable @next/next/no-img-element -- two tiny static SVGs, switched by CSS on the theme */

/** The Favolist mark for the current theme: both files are in the page and bundle.css shows the right one. */
export function Mark() {
  return (
    <>
      <img src="/brand/favolist-mark.svg" alt="" className="fv-mark-light" />
      <img src="/brand/favolist-mark-light.svg" alt="" className="fv-mark-dark" />
    </>
  );
}
