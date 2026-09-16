// Central TypeScript types — mirror the Django DRF serializer shapes
// exactly (see backend/apps/*/serializers.py) so the API layer needs no
// translation. Field names match the JSON the backend actually returns.

/* =========================================================
   ROLES
========================================================= */

export type RoleName =
  | "super_admin"
  | "admin"
  | "author"
  | "member"
  | "contributor"
  | "reader";

export interface Role {
  id: number;
  name: RoleName;
  label: string;
  description?: string;
}

/* =========================================================
   PROFILE
========================================================= */

export interface Profile {
  full_name: string;
  phone_number: string;
  whatsapp_number: string;
  avatar_url: string;
  bio: string;
  twitter: string;
  facebook: string;
  website: string;
}

/* =========================================================
   SUBSCRIBER APPLICATION
========================================================= */

export interface SubscriberApplication {
  application_id: string;
  channels_confirmed: string[];
  status: "pending" | "verified";
  created_at: string;
}

/* =========================================================
   USER
========================================================= */

export interface User {
  id: number;
  email: string;
  username: string;
  slug: string | null;

  role: Role;

  status:
    | "active"
    | "suspended"
    | "pending";

  profile: Profile;

  subscriber_application?:
    | SubscriberApplication
    | null;

  date_joined: string;
}

/* =========================================================
   CATEGORY
========================================================= */

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent?: number | null;
  order?: number;
}

/* =========================================================
   TAG
========================================================= */

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

/* =========================================================
   POST STATUS
========================================================= */

export type PostStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "changes_requested"
  | "approved"
  | "published"
  | "rejected"
  | "archived";

/* =========================================================
   APPROVAL EVENT
========================================================= */

export interface ApprovalEvent {
  id?: number;
  action: string;
  note: string;
  actor?: User;
  created_at: string;
}

/* =========================================================
   VIDEO
========================================================= */

export interface Video {
  id: number;
  title: string;
  bunny_video_id: string;
  thumbnail_url: string;
  playback_url: string;
  duration_seconds: number | null;

  status:
    | "uploading"
    | "processing"
    | "ready"
    | "failed";

  created_at: string;
}

/* =========================================================
   MEDIA
========================================================= */

export interface Media {
  id: number;
  post: number | null;

  type:
    | "image"
    | "document";

  file_name: string;
  url: string;
  mime_type: string;
  size_bytes: number | null;
  width: number | null;
  height: number | null;
  alt_text: string;
  created_at: string;
}

/* =========================================================
   POST SUMMARY
   List-view shape — matches PostListSerializer
   (no `content` field)
========================================================= */

export interface PostSummary {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  featured_image_url: string;

  author: User;
  category: Category;

  status: PostStatus;

  views: number;

  is_breaking: boolean;
  is_featured: boolean;
  is_trending: boolean;

  published_at: string | null;
  created_at: string;
}

/* =========================================================
   POST DETAIL
   Detail-view shape — matches PostDetailSerializer
========================================================= */

export interface Post
  extends Omit<
    PostSummary,
    "author" | "category"
  > {
  content: string;

  author: User;
  category: Category;

  tags: Tag[];

  video?: Video | null;

  review_note: string;

  seo_title: string;
  seo_description: string;

  updated_at: string;

  approval_history: ApprovalEvent[];
}

/* =========================================================
   VIDEO FEED ITEM
   Matches VideoFeedItemSerializer
========================================================= */

export interface VideoFeedItem {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  featured_image_url: string;

  video: Video;

  category: Category;
  author: User;

  views: number;

  published_at: string | null;
  created_at: string;
}

/* =========================================================
   POST WRITE PAYLOAD
========================================================= */

export interface PostWritePayload {
  title: string;
  short_description?: string;
  content: string;
  featured_image_url?: string;

  video?: number | null;

  category: number;

  tags?: number[];

  seo_title?: string;
  seo_description?: string;
}

/* =========================================================
   COMMENT
========================================================= */

export interface Comment {
  id: number;
  post: number;
  user: User;
  parent: number | null;
  body: string;

  status:
    | "pending"
    | "approved"
    | "spam"
    | "rejected";

  created_at: string;
}

/* =========================================================
   NOTIFICATION
========================================================= */

export interface Notification {
  id: number;
  type: string;
  data: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

/* =========================================================
   PAGINATION
   Wraps every DRF PageNumberPagination response.
========================================================= */

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/* =========================================================
   API ERROR
========================================================= */

export interface ApiErrorShape {
  detail?: string;
  errors?: Record<string, string[]>;
  [key: string]: unknown;
}