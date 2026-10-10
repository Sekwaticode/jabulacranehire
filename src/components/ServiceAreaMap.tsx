// Stylised sketch of the three provinces we serve. The shapes are simplified
// and not to scale: it shows where we work, not where the borders run.
export default function ServiceAreaMap() {
  const label =
    "font-tight text-[13px] font-bold tracking-[0.12em] uppercase";

  return (
    <figure className="flex flex-col gap-4">
      <svg
        viewBox="0 0 400 350"
        role="img"
        aria-label="Map sketch showing Mpumalanga as our primary service area, with Gauteng and Limpopo also covered, and our base in Witbank."
        className="h-auto w-full"
      >
        <g strokeLinejoin="round" strokeWidth="3" className="stroke-jch-ink">
          <polygon
            points="60,48 250,24 342,62 332,132 252,152 172,142 92,152 50,104"
            className="fill-jch-orange/30"
          />
          <polygon
            points="106,168 164,158 186,194 162,236 114,232 98,200"
            className="fill-jch-orange/30"
          />
          <polygon
            points="192,164 256,158 336,142 352,212 322,292 252,322 202,292 176,246 194,202"
            className="fill-jch-orange"
          />
        </g>

        <g className="fill-jch-bg" textAnchor="middle">
          <text x="196" y="96" className={label}>
            Limpopo
          </text>
          <text x="141" y="203" className={label}>
            Gauteng
          </text>
          <text x="274" y="262" className={label}>
            Mpumalanga
          </text>
        </g>

        {/* Witbank sits in western Mpumalanga, close to the Gauteng border */}
        <circle cx="214" cy="204" r="7" className="fill-jch-bg stroke-jch-ink" strokeWidth="3" />
        <text x="228" y="209" className={`${label} fill-jch-bg`}>
          Witbank
        </text>
      </svg>
      <figcaption className="flex flex-wrap gap-x-6 gap-y-2 font-tight text-[13px] font-semibold tracking-[0.08em] text-jch-dim uppercase">
        <span className="flex items-center gap-2 before:size-3 before:bg-jch-orange">
          Primary area
        </span>
        <span className="flex items-center gap-2 before:size-3 before:bg-jch-orange/30">
          Also covered
        </span>
        <span className="normal-case tracking-normal font-normal">Sketch, not to scale.</span>
      </figcaption>
    </figure>
  );
}
