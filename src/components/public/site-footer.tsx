import Image from "next/image";
import Link from "next/link";

import {
  FacebookIcon,
  YoutubeIcon,
  InstagramIcon,
} from "@/components/icons/social-icons";

import { FaWhatsapp } from "react-icons/fa";

import { SITE_NAME } from "@/lib/site-config";

/* =========================================================
   WAR OF JUSTICE SOCIAL CHANNELS
========================================================= */

const SOCIAL_ICONS = [
  {
    href: "https://www.youtube.com/@warofjustice1?si=UbnxbMjDcVwH1gEG&cxqr=raBA8pGCOZlvl2nqpeDJez",
    icon: YoutubeIcon,
    label: "YouTube",
  },
  {
    href: "https://whatsapp.com/channel/0029Vb8OkvXCXC3GpYsFSm0o",
    icon: FaWhatsapp,
    label: "WhatsApp Channel",
  },
  {
    href: "https://www.facebook.com/share/1SMGVTJ5Vn/",
    icon: FacebookIcon,
    label: "Facebook",
  },
  {
    href: "https://www.instagram.com/warofjusticeprs/",
    icon: InstagramIcon,
    label: "Instagram",
  },
];

/* =========================================================
   FOOTER COLUMNS
========================================================= */

const FOOTER_COLUMNS = [
  {
    title: "Quick Links",
    links: [
      {
        href: "/latest",
        label: "Latest News",
      },
      {
        href: "/videos",
        label: "Videos",
      },
      {
        href: "/gallery",
        label: "Photos",
      },
      {
        href: "/category/world",
        label: "World",
      },
    ],
  },
  {
    title: "Resources",
    links: [
      {
        href: "/about",
        label: "About Us",
      },
      {
        href: "/contact",
        label: "Contact Us",
      },
      {
        href: "/register?role=author",
        label: "Become an Author",
      },
    ],
  },
  {
    title: "Legal",
    links: [
      {
        href: "/privacy",
        label: "Privacy Policy",
      },
      {
        href: "/terms",
        label: "Terms & Conditions",
      },
    ],
  },
];

/* =========================================================
   SITE FOOTER
========================================================= */

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 md:grid-cols-4">

        {/* =================================================
            BRAND + SOCIAL
        ================================================== */}

        <div className="col-span-2 md:col-span-1">
          <Link
            href="/"
            className="flex items-center"
          >
            <Image
              src="/logo.png"
              alt={SITE_NAME}
              width={180}
              height={60}
              priority
            />
          </Link>

          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Your trusted source for the latest news and
            in-depth analysis, updated around the clock.
          </p>

          {/* =================================================
              SOCIAL ICONS
          ================================================== */}

          <div className="mt-5 flex items-center gap-3">
            {SOCIAL_ICONS.map((social) => {
              const Icon = social.icon;

              return (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  title={social.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-400 transition-all duration-200 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-5 w-5" />
                </a>
              );
            })}
          </div>
        </div>

        {/* =================================================
            FOOTER COLUMNS
        ================================================== */}

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="mb-3 text-sm font-semibold text-white">
              {column.title}
            </h4>

            <ul className="space-y-2 text-sm">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* =================================================
          COPYRIGHT
      ================================================== */}

      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
      </div>
    </footer>
  );
}