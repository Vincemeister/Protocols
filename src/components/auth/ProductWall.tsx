import "./product-wall.css";

// The product wall behind sign-in and check-your-email (brand book, Motion):
// full-width rows of square product photos drifting sideways, alternate rows
// in opposite directions, under the scrim. Five rows on a phone, four on a
// desktop. The tiles are the artboard's placeholder tones until phase 2
// seeds real product photos to put here.
const ROWS: { seconds: number; tiles: string[] }[] = [
  { seconds: 120, tiles: ["#6b5a5f", "#c9bfb6", "#4f5a6b", "#e6dfd6", "#5a6b5e", "#b8a99a"] },
  { seconds: 95, tiles: ["#d9d2cb", "#3f3a44", "#a4b0a6", "#6b645a", "#efe9e2", "#5f5a6b"] },
  { seconds: 130, tiles: ["#8c7f85", "#e2d8cf", "#2a1a20", "#c2c9c1", "#6b5a5a", "#f1ede8"] },
  { seconds: 105, tiles: ["#4d3c43", "#cfc7bf", "#5a6b5e", "#e9e3dc", "#3a3f4d", "#b9b0a8"] },
  { seconds: 140, tiles: ["#b8a99a", "#2f2a33", "#dcd4cc", "#6b5a5f", "#a9b4a7", "#ece6e8", "#4f5a6b", "#cfc7bf"] },
];

export function ProductWall() {
  return (
    <>
      <div className="wall" aria-hidden="true">
        {ROWS.map((row, i) => (
          <div key={i} className="wall-row">
            {/* The tiles repeat (three sets, the track slides by one) so the loop has no seam on wide screens. */}
            <div className="wall-track" style={{ animationDuration: `${row.seconds}s` }}>
              {[...row.tiles, ...row.tiles, ...row.tiles].map((tone, j) => (
                <div key={j} className="wall-tile" style={{ background: tone }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="wall-scrim" aria-hidden="true" />
    </>
  );
}
