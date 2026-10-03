
"use client";

import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import GlobalInaugurationEffects from "./global-inauguration-effects";
const STORAGE_KEY = "woj-inauguration-dismissed";

export default function InaugurationPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      setOpen(sessionStorage.getItem(STORAGE_KEY) !== "yes");
    } catch {
      setOpen(true);
    }
  }, []);

  const close = useCallback(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, "yes");
    } finally {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  if (!open) return null;

  return (
    <>
      {/* Flowers exist only while the popup is open */}
      <GlobalInaugurationEffects />

      {/* Popup overlay */}
      <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/40 p-4 sm:p-4"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="War of Justice inauguration"
          className="relative h-[94dvh] max-h-[950px] w-[98vw] max-w-[1500px] overflow-hidden rounded-xl bg-transparent shadow-2xl"
        >
          <button
            type="button"
            onClick={close}
            aria-label="Close inauguration popup"
            className="absolute right-2 top-2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 shadow-lg transition hover:scale-105 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <X className="h-5 w-5" />
          </button>

          <iframe
            src="/inauguration.html"
            title="War of Justice inauguration"
            className="block h-full w-full border-0 bg-transparent"
          />
        </div>
      </div>
    </>
  );
}