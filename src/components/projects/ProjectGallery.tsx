"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "@/lib/useLang";
import { PROJECT_LABELS } from "./labels";

/** Responsive thumbnail grid that opens a full-screen lightbox (arrows, swipe, Esc, no background scroll). */
export default function ProjectGallery({ images, title }: { images: string[]; title: string }) {
  const { lang } = useLang();
  const L = PROJECT_LABELS[lang];
  const [index, setIndex] = useState<number | null>(null);
  const opener = useRef<HTMLElement | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const n = images.length;

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (d: number) => setIndex((i) => (i === null ? i : (i + d + n) % n)),
    [n],
  );

  const isOpen = index !== null;
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    const trigger = opener.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
      trigger?.focus();
    };
  }, [isOpen, close, step]);

  // Preload the neighbours so next / previous feel instant.
  useEffect(() => {
    if (index === null || n < 2) return;
    [images[(index + 1) % n], images[(index - 1 + n) % n]].forEach((src) => {
      const im = new window.Image();
      im.src = src;
    });
  }, [index, images, n]);

  if (n === 0) return null;

  return (
    <>
      <div className="proj-gallery">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className="proj-gallery__item"
            aria-label={`${title} — ${i + 1} ${L.of} ${n}`}
            onClick={(e) => {
              opener.current = e.currentTarget;
              setIndex(i);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {index !== null && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={close}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          }}
        >
          <button
            ref={closeBtn}
            type="button"
            className="lightbox__btn lightbox__close"
            aria-label={L.close}
            onClick={close}
          >
            ×
          </button>
          {n > 1 && (
            <button
              type="button"
              className="lightbox__btn lightbox__nav lightbox__nav--prev"
              aria-label={L.prev}
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
            >
              ‹
            </button>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={index}
            className="lightbox__img"
            src={images[index]}
            alt={`${title} ${index + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {n > 1 && (
            <button
              type="button"
              className="lightbox__btn lightbox__nav lightbox__nav--next"
              aria-label={L.next}
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
            >
              ›
            </button>
          )}
          <span className="lightbox__count" aria-live="polite">
            {index + 1} {L.of} {n}
          </span>
        </div>
      )}
    </>
  );
}
