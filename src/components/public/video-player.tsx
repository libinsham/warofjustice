"use client";

import { useEffect, useRef } from "react";
import type Hls from "hls.js";

/**
 * Plays a Bunny Stream HLS (.m3u8) URL. Safari/iOS support HLS natively
 * via <video>; everywhere else needs hls.js since HLS isn't natively
 * supported by most browsers' <video> element.
 */
export function VideoPlayer({ playbackUrl, posterUrl }: { playbackUrl: string; posterUrl?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playbackUrl) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playbackUrl;
      return;
    }

    let hls: Hls | null = null;
    let cancelled = false;

    import("hls.js").then(({ default: HlsLib }) => {
      if (cancelled) return;
      if (HlsLib.isSupported()) {
        hls = new HlsLib();
        hls.loadSource(playbackUrl);
        hls.attachMedia(video);
      }
    });

    return () => {
      cancelled = true;
      hls?.destroy();
    };
  }, [playbackUrl]);

  return (
    <video
      ref={videoRef}
      controls
      poster={posterUrl}
      className="aspect-video w-full rounded-xl bg-black"
    />
  );
}
