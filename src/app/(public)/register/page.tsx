"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { authApi } from "@/lib/api/auth";
import { useAuth } from "@/providers/auth-provider";

const baseSchema = {
  email: z.string().email("Enter a valid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
};

const readerSchema = z.object(baseSchema);
const authorSchema = z.object({ ...baseSchema, bio: z.string().optional() });

export default function RegisterPage() {
  const { refresh } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"reader" | "author">("reader");
  const [authorMessage, setAuthorMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const readerForm = useForm<z.infer<typeof readerSchema>>({ resolver: zodResolver(readerSchema) });
  const authorForm = useForm<z.infer<typeof authorSchema>>({ resolver: zodResolver(authorSchema) });

  const onReaderSubmit = async (data: z.infer<typeof readerSchema>) => {
    setServerError(null);
    try {
      await authApi.registerReader(data);
      await refresh();
      router.push("/");
    } catch {
      setServerError("Registration failed. That email may already be in use.");
    }
  };

  const onAuthorSubmit = async (data: z.infer<typeof authorSchema>) => {
    setServerError(null);
    try {
      const res = await authApi.registerAuthor(data);
      setAuthorMessage(res.message);
    } catch {
      setServerError("Registration failed. That email may already be in use.");
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16">
      <h1 className="text-2xl font-black">Create your account</h1>

      <Tabs value={mode} onValueChange={(v) => setMode(v as "reader" | "author")} className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="reader" className="flex-1">Subscribe</TabsTrigger>
          <TabsTrigger value="author" className="flex-1">Reporter / Author</TabsTrigger>
        </TabsList>

        {serverError && (
          <div className="mt-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{serverError}</div>
        )}

        <TabsContent value="reader">
          <form onSubmit={readerForm.handleSubmit(onReaderSubmit)} className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="r-email">Email</Label>
              <Input id="r-email" type="email" {...readerForm.register("email")} />
              {readerForm.formState.errors.email && (
                <p className="text-xs text-destructive">{readerForm.formState.errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-username">Username</Label>
              <Input id="r-username" {...readerForm.register("username")} />
              {readerForm.formState.errors.username && (
                <p className="text-xs text-destructive">{readerForm.formState.errors.username.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="r-password">Password</Label>
              <Input id="r-password" type="password" {...readerForm.register("password")} />
              {readerForm.formState.errors.password && (
                <p className="text-xs text-destructive">{readerForm.formState.errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={readerForm.formState.isSubmitting}>
              Subscribe
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="author">
          {authorMessage ? (
            <div className="mt-4 rounded-md bg-primary/10 p-4 text-sm text-primary">{authorMessage}</div>
          ) : (
            <form onSubmit={authorForm.handleSubmit(onAuthorSubmit)} className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="a-email">Email</Label>
                <Input id="a-email" type="email" {...authorForm.register("email")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-username">Username</Label>
                <Input id="a-username" {...authorForm.register("username")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-password">Password</Label>
                <Input id="a-password" type="password" {...authorForm.register("password")} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="a-bio">Short bio (optional)</Label>
                <Textarea id="a-bio" rows={3} {...authorForm.register("bio")} />
              </div>
              <p className="text-xs text-muted-foreground">
                Author accounts are reviewed by an admin before you can log in and publish.
              </p>
              <Button type="submit" className="w-full" disabled={authorForm.formState.isSubmitting}>
                Apply as author
              </Button>
            </form>
          )}
        </TabsContent>
      </Tabs>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
