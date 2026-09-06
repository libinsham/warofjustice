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

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await postsApi.getBySlug(slug);

    return {
      title: post.seo_title || post.title,
      description:
        post.seo_description ||
        post.short_description ||
        post.title,

      openGraph: {
        title: post.title,
        description: post.short_description || post.title,
        images: post.featured_image_url
          ? [post.featured_image_url]
          : [],
        type: "article",
      },

      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.short_description || post.title,
        images: post.featured_image_url
          ? [post.featured_image_url]
          : [],
      },
    };
  } catch {
    return {
      title: "Article not found",
    };
  }
}

export default async function ArticleDetailPage({
  params,
}: Props) {
  const { slug } = await params;

  let post;

  try {
    post = await postsApi.getBySlug(slug);
  } catch (error) {
    console.error("Failed to load article:", error);
    notFound();
  }

  if (!post) {
    notFound();
  }

  const related = await postsApi
    .listPublished({
      category: post.category?.slug,
      page: 1,
    })
    .then((response) =>
      response.results
        .filter((item) => item.slug !== post.slug)
        .slice(0, 3)
    )
    .catch((error) => {
      console.error("Failed to load related articles:", error);
      return [];
    });

  const readingTimeMins = Math.max(
    1,
    Math.round(
      (post.content?.split(/\s+/).length ?? 0) / 200
    )
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.short_description || "",
    image: post.featured_image_url
      ? [post.featured_image_url]
      : [],
    datePublished: post.published_at,
    author: [
      {
        "@type": "Person",
        name: post.author?.username || "War of Justice",
      },
    ],
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      {/* Breadcrumb */}

      <nav className="mb-4 text-xs text-muted-foreground">
        <Link
          href="/"
          className="hover:text-primary"
        >
          Home
        </Link>

        {post.category && (
          <>
            {" / "}

            <Link
              href={`/category/${post.category.slug}`}
              className="hover:text-primary"
            >
              {post.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1fr_320px]">

        {/* Article */}

        <article>
          {post.category && (
            <Badge>
              {post.category.name}
            </Badge>
          )}

          <h1 className="mt-3 text-3xl font-black leading-tight md:text-4xl">
            {post.title}
          </h1>

          {post.short_description && (
            <p className="mt-3 text-lg text-muted-foreground">
              {post.short_description}
            </p>
          )}

          {/* Author and date */}

          <div className="mt-4 flex flex-wrap items-center gap-3 border-b pb-4 text-sm">

            <span className="font-semibold">
              By {post.author?.username || "War of Justice"}
            </span>

            {post.published_at && (
              <>
                <span className="text-muted-foreground">
                  ·
                </span>

                <span className="text-muted-foreground">
                  {formatDistanceToNow(
                    new Date(post.published_at),
                    { addSuffix: true }
                  )}
                </span>
              </>
            )}

            <span className="text-muted-foreground">
              ·
            </span>

            <span className="text-muted-foreground">
              {readingTimeMins} min read
            </span>
          </div>

          {/* Featured image */}

          {post.featured_image_url && (
            <div className="mt-6 aspect-video w-full overflow-hidden rounded-xl bg-muted">
              <img
                src={post.featured_image_url}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          {/* Article content */}

          {post.content && (
            <div
              className="prose prose-neutral mt-8 max-w-none prose-headings:font-black prose-img:rounded-lg"
              dangerouslySetInnerHTML={{
                __html: post.content,
              }}
            />
          )}

          {/* Tags */}

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                >
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Related articles */}

          {related.length > 0 && (
            <section className="mt-12">

              <h2 className="mb-4 text-lg font-black uppercase tracking-wide">
                Related Stories
              </h2>

              <div className="grid gap-6 sm:grid-cols-3">
                {related.map((relatedPost) => (
                  <NewsCard
                    key={relatedPost.id}
                    post={relatedPost}
                  />
                ))}
              </div>

            </section>
          )}

          {/* Comments */}

          <CommentsSection postId={post.id} />

        </article>

        {/* Sidebar */}

        <aside className="space-y-8">

          <div>
            <h3 className="mb-3 border-b-2 border-primary pb-2 text-sm font-black uppercase">
              Most Read
            </h3>

            <p className="text-sm text-muted-foreground">
              Wire this to a most-viewed posts endpoint once added.
            </p>
          </div>

          <div>
            <h3 className="mb-3 border-b-2 border-primary pb-2 text-sm font-black uppercase">
              Trending
            </h3>

            <p className="text-sm text-muted-foreground">
              Wire this to the trending posts endpoint.
            </p>
          </div>

        </aside>

      </div>
    </div>
  );
}