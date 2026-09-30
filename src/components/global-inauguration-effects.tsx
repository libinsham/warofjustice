
"use client";

import { useEffect } from "react";

const PETALS = [
  "/images/rsoe-petals.png",
  "/images/rsoe-petals-2.png",
  "/images/rsoe-petals-3.png",
];

export default function GlobalInaugurationEffects() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const layer = document.createElement("div");
    layer.className = "woj-sitewide-petals";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const intervals: number[] = [];
    const timeouts: number[] = [];

    function addPetal() {
      const petal = document.createElement("img");
      const duration = 8 + Math.random() * 6;

      petal.src = PETALS[Math.floor(Math.random() * PETALS.length)];
      petal.alt = "";
      petal.draggable = false;
      petal.className = "woj-sitewide-petal";

      petal.style.left = `${Math.random() * 100}%`;
      petal.style.width = `${24 + Math.random() * 32}px`;
      petal.style.setProperty(
        "--woj-petal-duration",
        `${duration}s`
      );
      petal.style.setProperty(
        "--woj-petal-drift",
        `${-180 + Math.random() * 360}px`
      );
      petal.style.setProperty(
        "--woj-petal-rotation",
        `${-540 + Math.random() * 1080}deg`
      );
      petal.style.opacity = String(0.55 + Math.random() * 0.4);

      petal.addEventListener(
        "animationend",
        () => petal.remove(),
        { once: true }
      );

      layer.appendChild(petal);
    }

    for (let i = 0; i < 8; i++) {
      timeouts.push(window.setTimeout(addPetal, i * 400));
    }

    intervals.push(window.setInterval(addPetal, 950));

    return () => {
      intervals.forEach(window.clearInterval);
      timeouts.forEach(window.clearTimeout);
      layer.remove();
    };
  }, []);

  return null;
}