"use client";

import { useState } from "react";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import type { PostSummary } from "@/types";

export function GalleryGrid({ posts }: { posts: PostSummary[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const slides = posts.map((p) => ({ src: p.featured_image_url, title: p.title }));

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {posts.map((post, i) => (
          <button
            key={post.id}
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
          >
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(min-width: 1024px) 25vw, 50vw"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="line-clamp-1 text-left text-xs font-semibold text-white">{post.title}</p>
            </div>
          </button>
        ))}
      </div>

      <Lightbox
        open={openIndex !== null}
        index={openIndex ?? 0}
        close={() => setOpenIndex(null)}
        slides={slides}
      />
    </>
  );
}
