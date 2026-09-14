import { SITE_NAME } from "@/lib/site-config";

export const metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-black">About {SITE_NAME}</h1>
      <div className="prose prose-neutral mt-6 max-w-none">
        <p>
          {SITE_NAME} is a digital news and media platform delivering breaking
          news, in-depth analysis, video journalism, and photo galleries
          from India and around the world.
        </p>
        <p>
          Replace this placeholder copy with your organization&apos;s real
          mission, editorial standards, and team information.
        </p>
      </div>
    </div>
  );
}
