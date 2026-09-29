"use client";

// The strike, next to the sculpture. The old live view ran a flash down the object once per visit; a rendered
// sculpture can't carry that, so the event is the Blender film (made by scripts/specimen/fulgurite.py from the same
// record), played only when a visitor asks for it. Nothing loads until then. Without JavaScript the link opens the
// film itself. Portrait screens get the film framed for a phone, landscape screens the wide one.

import { useCallback, useEffect, useRef, useState } from "react";

const FILMS = {
  portrait: { webm: "/specimen/film/strike-phone-1080x1920.webm", mp4: "/specimen/film/strike-phone-1080x1920.mp4", w: 1080, h: 1920 },
  landscape: { webm: "/specimen/film/strike-desktop-1920x1080.webm", mp4: "/specimen/film/strike-desktop-1920x1080.mp4", w: 1920, h: 1080 },
} as const;

export default function StrikeFilm() {
  const dialog = useRef<HTMLDialogElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [film, setFilm] = useState<(typeof FILMS)[keyof typeof FILMS] | null>(null);

  const open = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    const d = dialog.current;
    if (!d || typeof d.showModal !== "function") return; // no <dialog>: let the link open the film
    e.preventDefault();
    setFilm(window.innerHeight > window.innerWidth ? FILMS.portrait : FILMS.landscape);
    d.showModal();
  }, []);

  // Once the sources are in the element, load and play; the film is silent, so it may start on its own.
  useEffect(() => {
    const v = video.current;
    if (!film || !v) return;
    v.load();
    v.play().catch(() => {
      /* autoplay refused: the controls are there */
    });
  }, [film]);

  const onClose = useCallback(() => {
    video.current?.pause();
    setFilm(null);
  }, []);

  return (
    <>
      <a className="fg-strike" href={FILMS.portrait.mp4} onClick={open}>
        Watch the strike <span className="fg-strike__len">12 s</span>
      </a>
      <dialog ref={dialog} className="fg-film" aria-label="The strike, a 12-second film without sound" onClose={onClose}>
        {film && (
          <video
            ref={video}
            className="fg-film__v"
            width={film.w}
            height={film.h}
            muted
            playsInline
            controls
            preload="none"
            data-layer="film"
          >
            <source src={film.webm} type="video/webm" />
            <source src={film.mp4} type="video/mp4" />
          </video>
        )}
        <form method="dialog" className="fg-film__bar">
          <button className="fg-film__close" type="submit" autoFocus>
            Close
          </button>
        </form>
      </dialog>
    </>
  );
}
