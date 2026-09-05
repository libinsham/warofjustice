"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { settingsApi } from "@/lib/api/settings";

/** The known settings keys this form manages — matches the "Website
 * settings / Logo and branding / SEO defaults / Social links / Newsletter
 * configuration" groups from the spec. Add more keys here as needed;
 * SiteSettings is a flexible key-value store on the backend. */
const FIELDS: { key: string; label: string; type: "text" | "textarea" }[] = [
  { key: "site_name", label: "Site Name", type: "text" },
  { key: "logo_url", label: "Logo URL", type: "text" },
  { key: "seo_default_title", label: "Default SEO Title", type: "text" },
  { key: "seo_default_description", label: "Default SEO Description", type: "textarea" },
  { key: "social_twitter", label: "Twitter/X URL", type: "text" },
  { key: "social_facebook", label: "Facebook URL", type: "text" },
  { key: "social_instagram", label: "Instagram URL", type: "text" },
  { key: "newsletter_provider_key", label: "Newsletter Provider API Key", type: "text" },
];

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.list(),
  });

  const [values, setValues] = useState<Record<string, string>>({});
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    if (!settings) return;
    const map: Record<string, string> = {};
    for (const s of settings) map[s.key] = typeof s.value === "string" ? s.value : JSON.stringify(s.value ?? "");
    setValues((prev) => ({ ...map, ...prev }));
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (key: string) => settingsApi.upsert(key, values[key] ?? ""),
    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSavedKey(key);
      setTimeout(() => setSavedKey(null), 1500);
    },
  });

  if (isLoading) return <Skeleton className="h-96 w-full" />;

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-xl font-bold">Site Settings</h2>
      <p className="text-sm text-muted-foreground">
        Only Super Admins can save changes here — the backend independently enforces this.
      </p>

      <Card>
        <CardHeader><CardTitle className="text-sm">General</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {FIELDS.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <div className="flex gap-2">
                {field.type === "textarea" ? (
                  <Textarea
                    id={field.key}
                    rows={2}
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                ) : (
                  <Input
                    id={field.key}
                    value={values[field.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [field.key]: e.target.value }))}
                  />
                )}
                <Button
                  variant="outline"
                  disabled={saveMutation.isPending}
                  onClick={() => saveMutation.mutate(field.key)}
                >
                  {savedKey === field.key ? "Saved" : "Save"}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
