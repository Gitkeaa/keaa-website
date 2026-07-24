# Site Feedback — backend contract

The public feedback widget (`src/components/FeedbackWidget.jsx`) posts to `POST /api/feedback`.

> **STATUS: BUILT AND VERIFIED.** The endpoint exists and submissions save. Everything in sections
> 1 to 3 below is implemented in the Spring Boot project
> **`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api`**, package `com.keaa.adminapi.feedback`
> (`Feedback.java`, `FeedbackRepository.java`, `FeedbackController.java`) plus two lines in
> `config/SecurityConfig.java`. Compiles clean, and a submission driven through the real widget in
> a browser returned HTTP 200 and landed a row in the `feedback` table. **Section 4 is the part
> still outstanding** — there is no admin screen to read any of it yet.
>
> The project is not in git. A backup of `src`, `pom.xml` and `uploads` was taken at
> `c:\Users\Web-Pc\IdeaProjects\keaa-admin-api-backup-before-feedback` before these edits.

This file stays as the reference for what was built and, more importantly, **why** it was built
this way rather than the obvious way. It was written against
`com.keaa.adminapi.catalogue.CatalogueRequestController`, the other public unauthenticated POST
from the website.

## Why feedback must NOT become an `Inquiry`

This is the important decision, and the tempting wrong answer.

Every other public form on the site converges on one record: `com.keaa.adminapi.inquiry.Inquiry`,
with `type` set to `RFQ | EXPORT | CONTACT | CATALOGUE`. Adding a fifth type would be a two-line
change and it would be wrong, because an `Inquiry` is not a container, it is a **lead in a sales
pipeline**. On creation `InquiryService` runs `AssignmentService`, which auto-assigns the row to the
Sales member whose territory matches the country and product category. It then carries the sales
status machine `NEW → CONTACTED → QUOTATION_SENT → FOLLOW_UP → NEGOTIATION → WON / LOST → CLOSED`,
and a `LeadMailer` notification fires to the owning desk.

Feedback fits none of that. It is frequently anonymous, so there is no country or category to assign
on. It carries a numeric rating meant to be averaged, which no `Inquiry` field holds. Most of it is
never replied to, so "WON / LOST" is meaningless. Routing it through the pipeline would drop
unassignable, unworkable rows into a Business Development queue that the team treats as a to-do
list, and would put a satisfaction rating behind a "Quotation Sent" button.

So: its own table, its own controller, its own light status set. It shares nothing with `Inquiry`
except the shape of the public POST.

---

## 1. Entity

`com.keaa.adminapi.feedback.Feedback` → table `feedback`.

| Column | Type | Written by | Notes |
|---|---|---|---|
| `id` | IDENTITY | MySQL | |
| `rating` | `int`, not null | widget, always 1 to 5 | The star rating. Required client-side; **validate the range server-side too.** |
| `type` | `varchar(20)`, not null | widget | One of `suggestion`, `feedback`, `issue`, `compliment`. Defaults to `feedback` in the form. |
| `message` | `TEXT`, not null | widget | Capped at 200 words client-side. A client cap is not a control, so cap the column server-side as well. |
| `name` | `varchar(255)` null | widget, optional | Blank string when not given. Store as `NULL` or `""`, but be consistent. |
| `email` | `varchar(255)` null | widget, optional | Required by the client **only** when `contactConsent` is true. |
| `contactConsent` | `boolean`, not null, default `false` | widget | The visitor's answer to "Would you like us to contact you?". See the note below, it is not decorative. |
| `pageUrl` | `varchar(512)` null | widget | Path + query the feedback was sent from, e.g. `/products/valves?page=2`. |
| `status` | `varchar(20)`, default `"new"` | `PATCH /api/feedback/{id}/status` | `new` / `reviewed` / `actioned` / `closed`. Matches the shape the other modules use. |
| `createdAt` | `Instant` | Java on insert | Same `@PrePersist` pattern as `Inquiry.onCreate()`. |

Fields the widget does **not** send, and must not be invented server-side: company, phone,
country. Feedback is deliberately low-friction; asking for them would defeat the point.

### `contactConsent` is a legal field, not a UI flag

The privacy policy now tells visitors their address is used "only to reply to this feedback".
A row with `contactConsent = false` therefore **must not** be mailed, added to any list, or used
for follow-up, even when an email address is present. Whoever builds the admin page should surface
this plainly on the row rather than leaving it to be inferred.

## 2. Public endpoint

```
POST /api/feedback      Content-Type: application/json      NO auth
```

Request body, exactly as `submitPublicForm` sends it:

```json
{
  "rating": 4,
  "type": "suggestion",
  "message": "The product filter is great, but I could not find datasheets for the 6-inch range.",
  "name": "",
  "email": "someone@example.com",
  "contactConsent": true,
  "pageUrl": "/products/butterfly-valves"
}
```

Respond **200** with the created row as JSON. The widget ignores the body on success, so an empty
`{}` is also acceptable, but returning the row keeps this consistent with `/api/rfq` and
`/api/contact` and leaves room for showing a reference number later.

Reject with **400** when `rating` is outside 1 to 5, when `message` is blank, or when
`contactConsent` is true and `email` is blank. Do not 500 on a missing field the way
`POST /api/products` currently does.

### SecurityConfig

This is the change that actually makes the endpoint reachable, and it is why the widget showed an
error rather than a 404 before it was applied: with no matcher, the POST fell through to
`.anyRequest().authenticated()` and Spring Security answered **403** before any controller was
consulted.

In `SecurityConfig.java` (line 50), the existing public-POST matcher was extended, kept **above**
the role rules so the public POST still wins over `/api/<x>/**`:

```java
.requestMatchers(HttpMethod.POST, "/api/rfq", "/api/contact", "/api/careers",
        "/api/catalogue-requests", "/api/feedback").permitAll()
```

Note the matcher is on the **exact** path. `POST /api/feedback/` with a trailing slash will not
match and returns 404 or 403. `submitPublicForm` concatenates `API_BASE + path` naively, so make
sure `VITE_ADMIN_API` carries no trailing slash or the request goes to `//api/feedback`.

CORS must allow the site origin for this route, exactly as it does for the other three public
POSTs. If it does not, the browser's preflight `OPTIONS /api/feedback` fails and the visitor sees
the generic error with nothing useful in the server log.

## 3. Authenticated endpoints (for the admin page)

```
GET   /api/feedback                  list, newest first
PATCH /api/feedback/{id}/status      body {"status": "reviewed"}
```

Both are implemented and gated in `SecurityConfig` by:

```java
.requestMatchers("/api/feedback/**").hasAnyRole("SUPER_ADMIN", "SENIOR_ADMIN", "ADMIN", "BUSINESS_DEVELOPMENT")
```

which mirrors the `feedback` entry in `src/admin/auth/roles.js`. Note that rule sits **below** the
public POST matcher, so an anonymous `POST /api/feedback` still succeeds while an anonymous
`GET /api/feedback` returns 403 (verified).

A `GET /api/feedback/summary` returning the average rating and a count per `type` would let the
dashboard show a satisfaction tile, but it is not required for the module to work.

## 4. Frontend work still outstanding once this lands

1. Flip `implemented: false` to `true` on the `feedback` entry in
   [src/admin/auth/roles.js](src/admin/auth/roles.js). That alone puts it in the sidebar for the
   right roles and turns a deep-link into a real page rather than a redirect.
2. Add `MessageSquare` to [src/admin/adminIcons.js](src/admin/adminIcons.js) so the sidebar can
   resolve the icon name already declared on the module.
3. Build `src/admin/pages/AdminFeedback.jsx` and register its route in
   [src/App.jsx](src/App.jsx), following `AdminContacts.jsx`. The list wants: rating, type,
   message, page, whether a reply was invited, and the status control.

Until step 1 happens the module is invisible in the console. Feedback is now being **collected and
stored**, but nobody on the team can read it from the admin panel yet — `GET /api/feedback` works,
there is simply no screen calling it. Until that page exists, the only way to see submissions is a
direct query:

```sql
SELECT rating, type, message, name, email, contact_consent, page_url, created_at
FROM feedback ORDER BY created_at DESC;
```
