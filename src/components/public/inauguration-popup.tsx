"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function InaugurationPopup() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Show popup when the homepage opens.
    // It will stay closed for the rest of this browser session
    // after the visitor clicks the close button.
    const alreadyClosed = sessionStorage.getItem(
      "war-of-justice-inauguration-closed"
    );

    if (!alreadyClosed) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem(
      "war-of-justice-inauguration-closed",
      "true"
    );

    setOpen(false);
  };

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black">
      {/* Close button */}
      <button
        type="button"
        onClick={handleClose}
        aria-label="Close inauguration popup"
        className="absolute right-4 top-4 z-[10001] flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-2xl transition hover:scale-105 hover:bg-neutral-100"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Uploaded inauguration HTML page */}
      <iframe
        src="/inauguration/index.html"
        title="War of Justice Press Inauguration"
        className="h-full w-full border-0"
      />
    </div>
  );
}