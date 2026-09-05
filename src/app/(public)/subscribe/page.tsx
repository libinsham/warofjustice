"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { QRCodeSVG } from "qrcode.react";
import { isAxiosError } from "axios";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/providers/auth-provider";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/site-config";
import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from "@/components/icons/social-icons";

const CHANNELS = [
  { key: "youtube", label: "YouTube", url: SOCIAL_LINKS.youtube, icon: YoutubeIcon, color: "bg-red-600" },
  { key: "whatsapp", label: "WhatsApp Channel", url: SOCIAL_LINKS.facebook, icon: null, color: "bg-green-500" },
  { key: "facebook", label: "Facebook", url: SOCIAL_LINKS.facebook, icon: FacebookIcon, color: "bg-blue-600" },
  { key: "instagram", label: "Instagram", url: SOCIAL_LINKS.instagram, icon: InstagramIcon, color: "bg-gradient-to-br from-purple-600 to-pink-500" },
  { key: "twitter", label: "X / Twitter", url: SOCIAL_LINKS.twitter, icon: TwitterIcon, color: "bg-black" },
];

const subscribeSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  phone_number: z.string().min(8, "Enter a valid mobile number"),
  whatsapp_number: z.string().optional(),
});

type SubscribeFormValues = z.infer<typeof subscribeSchema>;

export default function SubscribePage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [confirmedChannels, setConfirmedChannels] = useState<Set<string>>(new Set());
  const [declared, setDeclared] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeSchema),
  });

  const toggleChannel = (key: string) => {
    setConfirmedChannels((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const onSubmit = async (data: SubscribeFormValues) => {
    setServerError(null);
    if (!declared) {
      setServerError("Please confirm the declaration before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      const user = await authApi.registerSubscriber({
        ...data,
        channels_confirmed: Array.from(confirmedChannels),
        declaration_confirmed: declared,
      });
      await refresh();
      const applicationId = user.subscriber_application?.application_id ?? "";
      router.push(`/subscribe/success?id=${encodeURIComponent(applicationId)}`);
    } catch (err) {
      const detail = isAxiosError(err)
        ? err.response?.data?.declaration_confirmed?.[0] ?? err.response?.data?.detail
        : null;
      setServerError(detail ?? "Registration failed. That email may already be in use.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">
          <a href="/" className="hover:underline">Home page</a> · Subscribe via Web Link →
        </p>
        <h1 className="mt-2 text-2xl font-black">Subscriber Registration</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {serverError && (
          <div className="rounded-md bg-destructive/10 px-4 py-2 text-sm text-destructive">{serverError}</div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="font-bold">Account Credentials</h2>
              <div className="space-y-1.5">
                <Label htmlFor="username">User Name</Label>
                <Input id="username" placeholder="Enter your user name" {...register("username")} />
                {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="Enter your password" {...register("password")} />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-6">
              <h2 className="font-bold">Contact Information</h2>
              <div className="space-y-1.5">
                <Label htmlFor="full_name">Name</Label>
                <Input id="full_name" placeholder="Enter your full name" {...register("full_name")} />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="Enter your email address" {...register("email")} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone_number">Cell No.</Label>
                <Input id="phone_number" placeholder="+91 Enter mobile number" {...register("phone_number")} />
                {errors.phone_number && <p className="text-xs text-destructive">{errors.phone_number.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="whatsapp_number">WhatsApp No.</Label>
                <Input id="whatsapp_number" placeholder="+91 Enter WhatsApp number" {...register("whatsapp_number")} />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <p className="text-sm font-semibold text-primary">
              Follow {SITE_NAME} — please follow our official channels before submitting your application
            </p>
            <p className="text-xs text-muted-foreground">
              Scan the QR code or click each card, then check it off below.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {CHANNELS.map((channel) => {
                const confirmed = confirmedChannels.has(channel.key);
                return (
                  <button
                    key={channel.key}
                    type="button"
                    onClick={() => toggleChannel(channel.key)}
                    className={`flex flex-col items-center gap-2 rounded-lg border-2 p-3 text-center transition ${
                      confirmed ? "border-primary bg-white" : "border-transparent bg-white"
                    }`}
                  >
                    <span className="text-xs font-semibold">{channel.label}</span>
                    <a href={channel.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                      <QRCodeSVG value={channel.url} size={72} />
                    </a>
                    <span
                      className={`w-full rounded px-2 py-1 text-xs font-bold text-white ${channel.color} ${
                        confirmed ? "opacity-100" : "opacity-70"
                      }`}
                    >
                      {confirmed ? "✓ Subscribed" : "Click to Subscribe"}
                    </span>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={declared}
            onChange={(e) => setDeclared(e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-input"
          />
          <span>
            Declaration: I confirm that I have followed all the above official channels before submitting my application.
          </span>
        </label>

        <Button type="submit" size="lg" className="w-full" disabled={submitting}>
          {submitting ? "Submitting…" : "Submit Application"}
          <ArrowRight className="h-4 w-4" />
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          All information will be kept confidential · Secure submission
        </p>
      </form>
    </div>
  );
}
