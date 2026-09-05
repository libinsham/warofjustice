import Image from "next/image";
import Link from "next/link";
import { FacebookIcon, TwitterIcon, YoutubeIcon, InstagramIcon } from "@/components/icons/social-icons";

import { SITE_NAME, SOCIAL_LINKS } from "@/lib/site-config";

const SOCIAL_ICONS = [
  { href: SOCIAL_LINKS.facebook, icon: FacebookIcon, label: "Facebook" },
  { href: SOCIAL_LINKS.twitter, icon: TwitterIcon, label: "X / Twitter" },
  { href: SOCIAL_LINKS.youtube, icon: YoutubeIcon, label: "YouTube" },
  { href: SOCIAL_LINKS.instagram, icon: InstagramIcon, label: "Instagram" },
];

const FOOTER_COLUMNS = [
  {
    title: "Quick Links",
    links: [
      { href: "/latest", label: "Latest News" },
      { href: "/videos", label: "Videos" },
      { href: "/gallery", label: "Photos" },
      { href: "/category/world", label: "World" },
    ],
  },
  {
    title: "Resources",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact Us" },
      { href: "/register?role=author", label: "Become an Author" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <Link href="/" className="flex items-center">
            <Image src="/logo.png" alt={SITE_NAME} width={180} height={60} priority />
          </Link>
          <p className="mt-2 text-sm text-neutral-400">
            Your trusted source for the latest news and in-depth analysis, updated around the clock.
          </p>
          <div className="mt-4 flex items-center gap-4">
            {SOCIAL_ICONS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="text-neutral-400 hover:text-white"
              >
                <social.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {FOOTER_COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="mb-3 text-sm font-semibold text-white">{col.title}</h4>
            <ul className="space-y-2 text-sm">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-neutral-400 hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}
