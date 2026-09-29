import { SCULPTURE } from "@/lib/specimen/sculpture.generated";

/** A transparent pixel: what a wide screen loads instead, where the sculpture beside the text travels down itself. */
const NOTHING = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

type Key = keyof typeof SCULPTURE.windows;

/**
 * An era's own stretch of the rendered glass, in its own space above the era's text. Only on screens too narrow to
 * hold the sculpture beside the text (at most 900 px): there the sculpture can't travel down with the reader without
 * covering words, so the descent is told window by window instead. Cut from the Blender plate at the era's depth by
 * scripts/specimen/sculpture.py.
 */
export default function EraWindow({ id }: { id: Key }) {
  const small = SCULPTURE.files[`era-${id}-800.webp` as keyof typeof SCULPTURE.files];
  const large = SCULPTURE.files[`era-${id}-1320.webp` as keyof typeof SCULPTURE.files];
  return (
    <figure className="fg-window" data-sculpture data-window={id} aria-hidden="true">
      <picture>
        <source media="(min-width: 901px)" srcSet={NOTHING} />
        <img
          className="fg-window__img"
          data-layer="plate"
          src={`/specimen/era-${id}-800.webp`}
          srcSet={`/specimen/era-${id}-800.webp ${small.w}w, /specimen/era-${id}-1320.webp ${large.w}w`}
          sizes="100vw"
          width={small.w}
          height={small.h}
          loading="lazy"
          decoding="async"
          alt=""
        />
      </picture>
    </figure>
  );
}
