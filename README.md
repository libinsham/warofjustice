# NEWSHUB — Next.js Frontend

Real, working Next.js code — scaffolded with `create-next-app`, and every
stage of this build was checked with `tsc --noEmit` and a full `npm run
build` (not just written and assumed correct). 27 routes compile and
generate cleanly as of the last build.

## 1. Setup

```bash
cd frontend
npm install
cp .env.example .env.local   # point NEXT_PUBLIC_API_URL at your Django backend
npm run dev
```

Requires the Django backend (see `../backend/README.md`) running and
reachable at `NEXT_PUBLIC_API_URL` — this app has no mock backend; every
page fetches from the real API service layer in `src/lib/api/`.

**Note on fonts:** `layout.tsx` uses the system font stack instead of
`next/font/google`'s Geist fonts, because the sandbox this was built in
can't reach `fonts.googleapis.com`. The commented-out block at the top of
`layout.tsx` shows exactly what to restore on a machine with normal
internet access.

## 2. What's implemented

**Stack:** Next.js 16 (App Router) + TypeScript (strict) + Tailwind CSS +
shadcn/ui-style components (hand-built on the same Radix primitives
shadcn itself uses) + TanStack Query + React Hook Form + Zod +
lucide-react + Tiptap (rich text editor) + hls.js (video) +
yet-another-react-lightbox (gallery).

**API layer** (`src/lib/api/`): `auth.ts`, `posts.ts`, `categories.ts`,
`media.ts`, `videos.ts`, `gallery.ts`, `users.ts`, `comments.ts`,
`settings.ts` — every function maps to a Django endpoint that was
independently tested live during backend development.

**Public site:**
- Home, Article Detail (SEO + Schema.org structured data), Category,
  Search Results, Videos, Video Details (HLS playback via hls.js), Photo
  Gallery (with lightbox), Login, Register, Forgot/Reset Password, About,
  Contact, Privacy, Terms
- **Comments** on the article page — real create (starts pending) + list
  (approved only) flow, wired to the backend moderation queue

**Author Dashboard** (`/author/*`, route-protected):
- Dashboard overview, My Posts (status-dependent actions), Create/Edit
  Post with a **real Tiptap WYSIWYG editor** (bold/italic/headings/lists/
  quotes/links/inline image upload — swapped out the earlier plain
  textarea), Media Library (grid, upload, copy URL, delete)
- Deliberately no Publish button anywhere in the author flow

**Admin Dashboard** (`/admin/*`, route-protected):
- Dashboard overview with **real charts** (recharts: publishing trend
  line chart, category breakdown bar chart, both backed by new backend
  analytics endpoints), Pending Posts, Post Review (full moderation
  workflow), Media Library (tabbed images/videos/documents — Videos tab
  now shows real data), **Authors** management (approve pending / suspend
  / reactivate), **Categories** management (create/delete), **Settings**
  (site name, logo, SEO defaults, social links, newsletter key), **All
  Posts** (every status, searchable)

**Author Dashboard additions:** Profile page (avatar upload, bio, social
links — `PATCH /auth/me/`), Settings page (change password — `POST
/auth/change-password/`)

**Auth security:** the axios client now works with the backend's
httpOnly-cookie refresh flow — `withCredentials: true` on every request,
no refresh token ever touches JavaScript-readable storage. Login/register
only store the short-lived access token in memory; the refresh token
lives in a cookie the browser manages automatically.

**Route protection:** `ProtectedRoute` redirects unauthorized users
client-side for UX only — every endpoint independently enforces
permissions on the Django backend, so bypassing the frontend check still
gets a real 403 (confirmed live: a plain `admin` hitting the
Super-Admin-only Authors/Settings endpoints gets a real 403, and the UI
surfaces that cleanly rather than crashing).

## 3. New backend endpoints added during this phase

Building the frontend surfaced real gaps in the backend, fixed and
verified live before wiring the frontend to them:
- `GET/POST/PATCH/DELETE /api/v1/settings/{key}/` — added for Admin Settings
- `GET /api/v1/videos/`, `/api/v1/videos/{slug}/`, `/api/v1/gallery/` —
  added for Videos/Video Details/Photo Gallery pages
- `POST /api/v1/auth/forgot-password/`, `/reset-password/`,
  `/change-password/` — added, tested including one-time-use token
  rejection and wrong-current-password rejection
- `PATCH /api/v1/auth/me/` — self-service profile updates, for the Author
  Profile page
- `GET /api/v1/admin/videos/`, four `/api/v1/admin/analytics/*` endpoints
  — added for the Admin Media Library's Videos tab and the dashboard charts
- Login/register moved the refresh token from the JSON body into an
  httpOnly cookie; a real `POST /api/v1/auth/logout/` now blacklists it
- `PostDetailSerializer.video` was a raw foreign-key ID; nested it into a
  full `VideoMiniSerializer` so the frontend gets playback/thumbnail URLs
  without a second request

Running the backend's new pytest suite (35 tests) caught a real
inconsistency during this phase: the registration endpoints were still
returning the refresh token in the JSON body after the login endpoint
had already been switched to the cookie flow — fixed and now covered by
a regression test.

## 4. Not yet built

- Document uploads (Media model supports the type, upload flow only
  covers images end-to-end)
- XML sitemap / robots.txt
- Per-visit traffic analytics (the current analytics aggregate from
  existing Post/User data — total views, trends, category breakdowns —
  rather than tracking individual page views)

## 5. Suggested next phase

The reading/writing/moderation core and the security-hardening items
(httpOnly cookie auth, real email delivery) are both done now. The
remaining gaps are smaller: document uploads, sitemap/robots.txt, and
whatever real-world polish shows up once this runs against production
Postgres/R2/Bunny credentials.
