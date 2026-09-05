"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-3xl font-black">Contact Us</h1>
      <p className="mt-2 text-muted-foreground">Have a tip, correction, or question? Send us a message.</p>

      {submitted ? (
        <div className="mt-8 rounded-md bg-primary/10 p-6 text-primary">
          Thanks — we&apos;ve received your message and will respond soon.
        </div>
      ) : (
        <form
          className="mt-8 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: wire to a /contact backend endpoint once added.
            setSubmitted(true);
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" rows={5} required />
          </div>
          <Button type="submit">Send Message</Button>
        </form>
      )}
    </div>
  );
}
