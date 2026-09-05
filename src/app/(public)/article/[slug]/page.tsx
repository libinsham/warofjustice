import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import type { Metadata } from "next";

import { NewsCard } from "@/components/public/news-card";
import { CommentsSection } from "@/components/public/comments-section";
import { Badge } from "@/components/ui/badge";
import { postsApi } from "@/lib/api/posts";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await postsApi.getBySlug(slug);
    return {
      title: post.seo_title || post.title,
      description: post.seo_description || post.short_description,
      openGraph: {
        title: post.title,
        description: post.short_description,
        images: post.featured_image_url ? [post.featured_image_url] : [],
        type: "article",
      },
      twitter: { card: "summary_large_image", title: post.title, description: post.short_description },
    };
  } catch {
    return { title: "Article not found" };
  }
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = await postsApi.getBySlug(slug);
  } catch {
    notFound();
  }

  const related = await postsApi
    .listPublished({ category: post.category?.slug, page: 1 })
    .then((r) => r.results.filter((p) => p.slug !== post.slug).slice(0, 3))
    .catch(() => []);

  const readingTimeMins = Math.max(1, Math.round((post.content?.split(/\s+/).length ?? 0) / 200));

  // Structured data (Schema.org NewsArticle) for SEO.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    image: post.featured_image_url ? [post.featured_image_url] : [],
    datePublished: post.published_at,
    author: [{ "@type": "Person", name: post.author.username }],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-4 text-xs text-muted-foreground">
        <Link href="/" className="hover:text-primary">Home</Link>
        {" / "}
        <Link href={`/category/${post.category.slug}`} className="hover:text-primary">{post.category.name}</Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
        <article>
          <Badge>{post.category.name}</Badge>
          <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">{post.title}</h1>
          {post.short_description && (
            <p className="mt-3 text-lg text-muted-foreground">{post.short_description}</p>
          )}

          <div className="mt-4 flex items-center gap-3 border-b pb-4 text-sm">
            <span className="font-semibold">By {post.author.username}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : ""}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{readingTimeMins} min read</span>
          </div>

          {post.featured_image_url && (
            <div className="relative mt-6 aspect-video w-full overflow-hidden rounded-xl bg-muted">
              <Image src={post.featured_image_url} alt={post.title} fill priority className="object-cover" sizes="(min-width: 1024px) 60vw, 100vw" />
            </div>
          )}

          {/* Content comes from the rich-text editor as sanitized HTML on the
              backend. If sanitization isn't guaranteed server-side yet, run
              it through a client sanitizer (e.g. DOMPurify) before this
              dangerouslySetInnerHTML call. */}
          <div
            className="prose prose-neutral mt-8 max-w-none prose-headings:font-black prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">#{tag.name}</Badge>
              ))}
            </div>
          )}

          {related.length > 0 && (
            <section className="mt-12">
              <h2 className="mb-4 text-lg font-black uppercase tracking-wide">Related Stories</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {related.map((r) => <NewsCard key={r.id} post={r} />)}
              </div>
            </section>
          )}

          <CommentsSection postId={post.id} />
        </article>

        <aside className="space-y-8">
          <div>
            <h3 className="mb-3 border-b-2 border-primary pb-2 text-sm font-black uppercase">Most Read</h3>
            <p className="text-sm text-muted-foreground">Wire this to a most-viewed posts endpoint once added.</p>
          </div>
          <div>
            <h3 className="mb-3 border-b-2 border-primary pb-2 text-sm font-black uppercase">Trending</h3>
            <p className="text-sm text-muted-foreground">Wire this to the trending posts endpoint.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
