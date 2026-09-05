import { Badge } from "@/components/ui/badge";
import type { PostStatus } from "@/types";

const STATUS_CONFIG: Record<PostStatus, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }> = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Pending Review", variant: "warning" },
  under_review: { label: "Under Review", variant: "warning" },
  changes_requested: { label: "Changes Requested", variant: "outline" },
  approved: { label: "Approved", variant: "success" },
  published: { label: "Published", variant: "success" },
  rejected: { label: "Rejected", variant: "destructive" },
  archived: { label: "Archived", variant: "secondary" },
};

export function PostStatusBadge({ status }: { status: PostStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
