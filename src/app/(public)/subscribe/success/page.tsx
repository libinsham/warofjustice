"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Download, ArrowRight, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SITE_NAME } from "@/lib/site-config";
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from "@/components/icons/social-icons";

const CHANNEL_BADGES = [
  { label: "YouTube", icon: YoutubeIcon, color: "bg-red-600" },
  { label: "WhatsApp", icon: null, color: "bg-green-500" },
  { label: "Facebook", icon: FacebookIcon, color: "bg-blue-600" },
  { label: "Instagram", icon: InstagramIcon, color: "bg-gradient-to-br from-purple-600 to-pink-500" },
];

function SubscribeSuccessContent() {
  const searchParams = useSearchParams();
  const applicationId = searchParams.get("id") || "—";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <Card className="overflow-hidden border-2 border-primary/20">
        <div className="bg-gradient-to-b from-primary/5 to-transparent px-6 pt-10 text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">
            Application Submitted Successfully!
            <br />— You are now a Subscriber!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Thank you for joining {SITE_NAME} as a Free Subscriber
          </p>
        </div>

        <CardContent className="space-y-6 pt-6">
          <div>
            <div className="mb-1 flex items-center justify-between text-sm font-semibold">
              <span>Subscription Progress</span>
              <span className="flex items-center gap-1 text-green-600">100% Complete</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-full rounded-full bg-gradient-to-r from-primary to-green-500" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Application ID</p>
              <p className="mt-1 font-mono text-lg font-bold">{applicationId}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Next Steps</p>
              <ul className="mt-1 space-y-1 text-sm">
                <li className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Your application is under review
                </li>
                <li className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  Track status in dashboard
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="flex-1">
              <Link href="/">Go to Dashboard <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button variant="outline" size="lg" className="flex-1" disabled>
              <Download className="h-4 w-4" /> Download Receipt
            </Button>
          </div>

          <div className="border-t pt-4 text-center">
            <p className="mb-2 text-xs font-semibold text-muted-foreground">Stay connected:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {CHANNEL_BADGES.map((c) => (
                <span
                  key={c.label}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white ${c.color}`}
                >
                  {c.icon && <c.icon className="h-3 w-3" />}
                  Subscribed
                </span>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              You will receive a confirmation email shortly · Support: support@warofjustice.com
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={<div className="py-16 text-center text-sm text-muted-foreground">Loading…</div>}>
      <SubscribeSuccessContent />
    </Suspense>
  );
}
