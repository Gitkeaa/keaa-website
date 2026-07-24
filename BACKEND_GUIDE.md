# KEAA Backend Guide

Written for the developer who owns both projects. It covers how the system runs today, where
the data actually lives, the full path of one RFQ from the public form to the admin table,
what to change before going live, and what is still open.

Two projects:

| | Path | Version control |
|---|---|---|
| Frontend | `c:\Users\Web-Pc\Downloads\Code_base_keaa` | git repo (branch `admin-panel`) |
| Backend | `c:\Users\Web-Pc\IdeaProjects\keaa-admin-api` | **not a git repo — no safety net** |

Because the backend is not under version control, **copy the whole folder before you paste
anything from section 4 or section 6.** Exact command is in section 8.

Every file path, class name, endpoint and column below was read from the real code on
2026-07-20. Where something depends on Spring runtime behaviour and could not be confirmed
without a running server, it is marked **[verify live]** and the exact command to confirm it
is given.

---

## Table of contents

1. [How it works today](#1-how-it-works-today)
2. [Where the data lives](#2-where-the-data-lives)
3. [The full journey of one RFQ](#3-the-full-journey-of-one-rfq)
4. [Deploy hardening — do this before going live](#4-deploy-hardening--do-this-before-going-live)
5. [Employees vs customers — the architecture](#5-employees-vs-customers--the-architecture)
6. [Adding customer accounts, when you want them](#6-adding-customer-accounts-when-you-want-them)
7. [Security issues that are still open](#7-security-issues-that-are-still-open)
8. [Runbook](#8-runbook)

---

## 1. How it works today

### Three servers, not two

This is the single most common source of confusion in this project. In development there are
**three** processes, and two of them answer on paths beginning with `/api`.

| Process | Port | Started by | What it is |
|---|---|---|---|
| Vite dev server | **5173** | `npm run dev` in the frontend | Serves the React app. Also proxies `/api` — see below. |
| Gemini chat server | **3001** | `npm run dev:server` in the frontend (`server.js`) | Express server for the AI chat widget. **Nothing to do with the admin API.** |
| Spring Boot admin API | **8080** | `.\mvnw.cmd spring-boot:run` in the backend | The real backend. MySQL, users, RFQs, contacts, careers, products. |

`npm run dev:all` starts the first two together (via `concurrently`). It does **not** start
Spring Boot. You start that separately.

### The trap

`vite.config.js` contains:

```js
server: {
  port: 5173,
  open: true,
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
    },
  },
},
```

So in development **any relative URL starting with `/api` goes to the Gemini chat server on
3001, not to Spring on 8080.**

The code works around this by never using a relative URL for Spring. Both frontend clients
use an absolute base:

- `src/data/adminApi.js:16` — `const API_BASE = import.meta.env.VITE_ADMIN_API ?? 'http://localhost:8080'`
- `src/admin/api/client.js:11` — same expression, declared a second time

The one call that *is* relative is the chat: `src/components/AiChat.jsx:43` posts to
`/api/chat`, which is exactly what the proxy is for.

Consequences you must keep in mind:

- **Never set `VITE_ADMIN_API` to a relative value like `/api`.** In dev it would silently
  route every RFQ, contact message and job application into the chat server.
- **In production there is no Vite proxy.** `/api/chat` resolves same-origin and 404s unless
  the static host is configured to reverse-proxy it to `server.js`. The admin API is
  unaffected because it uses the absolute base.

### Request paths

```
                          BROWSER
                             |
        +--------------------+---------------------+
        |                                          |
   relative /api/chat                    absolute http://localhost:8080/api/...
        |                                          |   (VITE_ADMIN_API, inlined at build)
        v                                          v
  Vite dev server :5173                    Spring Boot :8080
   proxy /api -> :3001                     - SecurityConfig (CORS + rules)
        |                                  - JwtAuthFilter (reads keaa_token cookie)
        v                                  - @RestController
  server.js (Express) :3001                       |
   Google Gemini API                               v
                                             Spring Data JPA / Hibernate
                                                    |
                                                    v
                                             MySQL :3306
                                             database `keaa_admin`
```

### Public site vs admin console — two doors into the same Spring app

Both are served by the same React bundle on 5173 (or the same static host in production).

**Public, unauthenticated.** `src/data/adminApi.js` → `submitPublicForm(path, data)`. Plain
`fetch`, **no cookies**, `Content-Type: application/json`. Three callers:

| Frontend file | Endpoint |
|---|---|
| `src/pages/RequestQuotation.jsx:139` | `POST /api/rfq` |
| `src/pages/Contact.jsx:154` | `POST /api/contact` |
| `src/components/JobApplicationModal.jsx:115` | `POST /api/careers` |

**Admin, authenticated.** `src/admin/api/client.js` → `api.get/post/put/patch/del`. Every call
sends `credentials: 'include'` so the browser attaches the httpOnly `keaa_token` cookie.

### The login flow

1. `POST /api/auth/login {email, password}` — `AuthController.java:43`.
2. `authenticationManager.authenticate(...)` → `CustomUserDetailsService` reads the `users`
   table → `BCryptPasswordEncoder` compares the hash.
3. On success `lastActive` is stamped, `JwtService.generateToken(user)` mints an HS256 JWT
   with `sub` = email, `role`, `name`, 7-day expiry.
4. `AuthController.buildCookie()` returns it as `Set-Cookie: keaa_token=...; HttpOnly; Path=/;
   SameSite=Lax`. **`secure` is hardcoded `false`** — section 4 fixes that.
5. Response body: `{id, name, email, role}`.
6. Every later request passes `JwtAuthFilter`, which reads the cookie, verifies the signature,
   loads the user by email, checks `isActive()`, and grants `ROLE_<role>`.

The JWT never touches JavaScript. That is why the frontend uses cookies rather than an
`Authorization` header.

Two behaviours that follow from `JwtAuthFilter` and matter operationally:

- **Deactivating a user takes effect immediately.** `active` is re-read from the database on
  every request (`JwtAuthFilter.java:51-52`).
- **Changing a user's role does not.** The authority comes from the token claim
  (`JwtAuthFilter.java:49,56`), so a demoted SUPER_ADMIN keeps SUPER_ADMIN authority until
  their token expires (up to 7 days) or they log out and back in. The only in-product
  workaround today is to deactivate and reactivate them.
- **Logout is client-side only.** `AuthController.java:61-65` just overwrites the cookie with
  `Max-Age=0`. A token captured before logout is still valid for the rest of its 7 days.

### Build stack — check this before you paste any Stack Overflow snippet

`pom.xml` uses **Spring Boot 4.1.0**, Java 21. Boot 4 renamed things:

- `spring-boot-starter-webmvc`, **not** `spring-boot-starter-web`.
- Modular test starters (`spring-boot-starter-data-jpa-test`, `-security-test`,
  `-validation-test`, `-webmvc-test`) instead of `spring-boot-starter-test`.

jjwt is pinned at 0.12.6, so the builder API is `Jwts.builder().subject().claim().signWith()`
— the 0.11 style (`setSubject`, `setClaims`) will not compile.

Lombok is on. Entities use `@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder`,
controllers use `@RequiredArgsConstructor`.

`mvn` is not on PATH on this machine; `mvnw.cmd` is. `JAVA_HOME` is unset. See section 8.

---

## 2. Where the data lives

**MySQL, `localhost:3306`, database `keaa_admin`.** Connection string from
`src/main/resources/application.properties:4`:

```
jdbc:mysql://localhost:3306/keaa_admin?createDatabaseIfNotExist=true&serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false
```

Username `root`, password `Devkeaa@6198`, both plaintext in that file. `createDatabaseIfNotExist=true`
means the schema is created on first boot if it is missing.

### How the schema gets there: `ddl-auto=update`

`application.properties:9` sets `spring.jpa.hibernate.ddl-auto=update`. On every boot,
Hibernate compares your `@Entity` classes to the live database and issues DDL to close the gap.

**What it does:**

- Creates missing tables.
- Adds missing columns.
- Adds indexes and unique constraints where it can.

**What it never does — this is the part that surprises people later:**

| It will not | Consequence |
|---|---|
| Drop a table | Removing an `@Entity` leaves the table behind, full of data |
| Drop a column | Removing a field leaves an orphan column. If that column is `NOT NULL`, every subsequent insert fails |
| Rename anything | Renaming a field creates a **new** column; the old one stays with all the old data in it |
| Widen or retype a column | Changing `length = 20` to `50` in Java does nothing to the live column. Writing a 25-char value then fails with a data-truncation error |
| Apply `columnDefinition = "TEXT"` retroactively | If the column was created as `varchar(255)`, it stays `varchar(255)` |
| Create schema-level defaults | `active = true`, `status = "new"`, `createdAt = now` are **Java-side only**. A row inserted by raw SQL or a DB tool gets `active = 0` and `status = NULL` |
| Fail loudly | If a DDL statement fails (e.g. a unique index on `email` cannot be created because duplicates already exist), Hibernate logs it and **boots anyway**. The app then believes email is unique while the database does not enforce it |

Practical rule: `ddl-auto=update` is fine for development and for adding columns. The moment
you need to change a column's type, rename anything, or backfill, write the SQL by hand and run
it yourself. When this goes to production properly, move to Flyway or Liquibase.

One safe change worth knowing: **adding a value to the `Role` enum is safe** (roles are stored
as strings and `length = 20` has room). **Renaming or removing one is not** — every existing row
holding the old string throws `IllegalArgumentException` on read, which surfaces as a 500 from
`/api/users` and, worse, from `JwtAuthFilter`.

### Table: `users`

Entity `com.keaa.adminapi.user.User`.

| Column | Java type | Mapping | Written by | Read by |
|---|---|---|---|---|
| `id` | `Long` | `@Id @GeneratedValue(IDENTITY)` | MySQL | everything |
| `name` | `String` | nullable `varchar(255)` | `AdminUsers.jsx` create/edit form; `DataSeeder` | Users table; admin topbar; `GET /api/auth/me` |
| `email` | `String` | `nullable=false, unique=true` | create form only — **there is no way to change an email after creation** | login; `JwtAuthFilter` lookup; Users table |
| `password` | `String` | `nullable=false` | BCrypt hash, set at create only | `CustomUserDetailsService` at login. **Never serialised to the browser** |
| `role` | `Role` | `EnumType.STRING`, `nullable=false, length=20` | create + edit form | sidebar rendering (`src/admin/auth/roles.js`), JWT claim |
| `active` | `boolean` (primitive) | `@Builder.Default = true` → `bit(1) not null` | edit form | `JwtAuthFilter` on every request; `StatusPill` in Users table |
| `lastActive` | `Instant` | nullable | `AuthController.java:53` **at login only** — so it is really *last login*, not last activity | returned by `GET /api/users` but **never displayed** |
| `createdAt` | `Instant` | `@Column(updatable=false)` + `@PrePersist` | Java on insert | not displayed |

Endpoints: `GET/POST /api/users`, `PUT/DELETE /api/users/{id}` (`UserController`).
Response DTO is `UserController.UserDto(id, name, email, role, active, lastActive)` — the
password hash is never on the wire. `UpdateUserRequest` carries only `(name, role, active)`, so
**there is no password change or password reset anywhere in the API.**

Role values (`com.keaa.adminapi.user.Role`): `SUPER_ADMIN`, `HR`, `EMPLOYEE`, `SALES`.
Mirrored as string literals in `src/admin/auth/roles.js`. If you add a role server-side and
forget to mirror it, `navForRole` returns nothing and that user gets an **empty sidebar**.

### Table: `rfq_requests`

Entity `com.keaa.adminapi.rfq.RfqRequest`.

| Column | Type | Written by | Read by |
|---|---|---|---|
| `id` | IDENTITY | MySQL | `AdminRFQ.jsx` "Ref" column |
| `name` | `varchar(255)` null | public RFQ form field `#name` | `AdminRFQ.jsx` "Contact" |
| `company` | `varchar(255)` null | field `#company` | `AdminRFQ.jsx` "Company" |
| `email` | `varchar(255)` null | `<EmailField>` state | **never displayed in the admin console** |
| `phone` | `varchar(255)` null | dial code + number, **concatenated into one string** | **never displayed** |
| `country` | `varchar(255)` null | `country.name` — the display name, not an ISO code | `AdminRFQ.jsx` "Country" |
| `category` | `varchar(255)` null | `<select id="product">` — the option **text**, not a code | `AdminRFQ.jsx` "Category" |
| `message` | `TEXT` | requirement details + port of destination + sales region, **joined into one blob** | **never displayed** |
| `status` | `varchar(20)`, Java default `"new"` | `PATCH /api/rfq/{id}/status` from `InquiryManager` | `AdminRFQ.jsx` "Status"; dashboard counts `status = "new"` |
| `createdAt` | `Instant`, `updatable=false`, `@PrePersist` | Java on insert | `AdminRFQ.jsx` "Received" |

**Not one column is `NOT NULL` and there is no validation on the controller.** `POST {}` writes
an empty row.

Endpoints: `GET /api/rfq` (auth), `POST /api/rfq` (**public**), `PATCH /api/rfq/{id}/status` (auth).

### Table: `contact_messages`

Entity `com.keaa.adminapi.contact.ContactMessage`.

| Column | Type | Written by | Read by |
|---|---|---|---|
| `id` | IDENTITY | MySQL | — |
| `name` | `varchar(255)` null | `Contact.jsx` field `#name` | `AdminContacts.jsx` "Name" |
| `email` | `varchar(255)` null | `<EmailField>` state | `AdminContacts.jsx`, as a subtitle under the name |
| `subject` | `varchar(255)` null | field `#subject` | `AdminContacts.jsx` "Subject" |
| `message` | `TEXT` | message body **+ company + phone + country appended as a trailer line** | **never displayed** |
| `status` | `varchar(20)`, default `"unread"` | `PATCH /api/contact/{id}/status` | `AdminContacts.jsx`; dashboard counts `status = "unread"` |
| `createdAt` | `Instant` | Java on insert | `AdminContacts.jsx` "Received" |

There is no company, phone or country column here. `Contact.jsx:160` folds all three into
`message`:

```js
`${message}\n\n— Company: ${val('company') || '—'} · Phone: ${country?.dial||''} ${phone||'—'} · Country: ${country?.name||'—'}`
```

That trailer is appended **unconditionally**, even when every part is blank, so rows carry
noise like `— Company: — · Phone:  — · Country: India`. And since `message` is never rendered
in the console, none of it is visible anywhere today.

### Table: `job_applications`

Entity `com.keaa.adminapi.career.JobApplication`.

| Column | Type | Written by | Read by |
|---|---|---|---|
| `id` | IDENTITY | MySQL | — |
| `name` | `varchar(255)` null | `#app-name` | `AdminCareers.jsx` "Name" |
| `email` | `varchar(255)` null | `<EmailField>` | **never displayed** |
| `phone` | `varchar(255)` null | dial code + number concatenated | **never displayed** |
| `position` | `varchar(255)` null | `job.title` prop from `Careers.jsx:152` — not typed by the applicant | `AdminCareers.jsx` "Position" |
| `experience` | `varchar(255)` null | `<select #app-exp>` — a **label string** such as `"3–5 years"` | `AdminCareers.jsx` "Experience" |
| `location` | `varchar(255)` null | `#app-city` | `AdminCareers.jsx` "Location" |
| `resumeUrl` | `varchar(1000)` null | **always written as `''`** — the frontend cannot fill it | **never displayed** |
| `notes` | `TEXT` | cover message, qualification, notice period, current employer, LinkedIn, and the resume-delivery status — **all newline-joined into this one column** | **never displayed** |
| `status` | `varchar(20)`, default `"new"` | `PATCH /api/careers/{id}/status` | `AdminCareers.jsx`; dashboard counts `status = "new"` |
| `createdAt` | `Instant` | Java on insert | `AdminCareers.jsx` "Received" |

The applicant's selected country is **dropped entirely** — only the dial prefix survives, fused
into `phone`.

**CV uploads do not work today.** `src/data/adminApi.js:68` (`submitPublicFormWithFile`) posts
`multipart/form-data` with a `payload` JSON part and a `resume` file part.
`JobApplicationController.submit` is `@RequestBody JobApplication` with only Jackson converters
registered, so a multipart POST returns **415**. 415 is in the frontend's
`MULTIPART_UNSUPPORTED` set, so it falls back to a plain JSON submission and the applicant is
correctly told "We could not attach…". Every CV upload takes that path: one wasted request, the
file discarded, the application still lands.

### Table: `products`

Entity `com.keaa.adminapi.product.Product`.

| Column | Type | Written by | Read by |
|---|---|---|---|
| `id` | IDENTITY | MySQL | — |
| `itemCode` | `varchar(255)` null | `DataSeeder` only | — |
| `name` | `varchar(255)` **NOT NULL** | `DataSeeder` only | — |
| `category` | `varchar(255)` null | `DataSeeder` only | — |
| `subcategory` | `varchar(255)` null | `DataSeeder` only | — |
| `description` | `TEXT` | nothing | — |
| `imageUrl` | `varchar(1000)` | nothing | — |
| `createdAt` | `Instant` | Java on insert | — |

**The Products screen in the admin console is not connected to this table.**
`src/admin/pages/AdminProducts.jsx:5` imports `products` from `../../data/productHelpers`,
which reads the static `src/data/products.json`. The "Add Product" button has no `onClick`.

That means the dashboard's "Products" tile (counting rows in MySQL, seeded = 3) and the
Products page subtitle (counting entries in `products.json`) show **different numbers**. This
is expected, not a bug — but it looks like one.

`POST /api/products` with no `name` returns **500**, not 400, because nothing validates it and
the `NOT NULL` constraint throws.

There is **no public read endpoint for products.** `GET /api/products` is behind auth, so the
marketing site cannot fetch the catalogue from this API.

### Seed data

`com.keaa.adminapi.config.DataSeeder` is a `CommandLineRunner`. Each block runs **only when its
table is empty**, so restarts never duplicate. Seeded logins:

| Email | Password | Role |
|---|---|---|
| `admin@keaa-international.net` | `admin123` | SUPER_ADMIN |
| `sales@keaa-international.net` | `sales123` | SALES |
| `hr@keaa-international.net` | `hr123` | HR |

Also 3 demo products, 2 RFQs, 2 contact messages, 2 job applications.

Because the guard is `count() == 0`, deleting a single admin does **not** bring the seed back.
Delete the last SUPER_ADMIN while other users still exist and the console becomes
unenterable without direct SQL.

### Everything else about JPA here

There are **zero relationships** — no `@ManyToOne`, `@OneToMany`, `@OneToOne`, `@ManyToMany`,
`@JoinColumn` anywhere in `src/main/java`. All five tables are standalone with no foreign keys.
Nothing links an RFQ to a product, a user to an action, or an application to a job posting.

`spring.jpa.open-in-view=false` is set, which is correct — no lazy-loading surprises in the
view layer.

---

## 3. The full journey of one RFQ

This is the section that makes the rest make sense. Follow one quotation request from a
visitor's keyboard to an admin marking it "quoted".

### Hop 0 — the visitor lands on the form

Route `/rfq`, component `src/pages/RequestQuotation.jsx`. The page has two tabs, `rfq` and
`export` (state at `:19-22`). The `export` tab adds one extra field, "Port of Destination".

**Both tabs POST to the identical endpoint with no discriminator.** Nothing in the stored row
records which tab was used. The only trace is whether a `Port of destination:` line happens to
appear inside `message`.

If a staff member is signed in, `RequestQuotation.jsx:116-121` prefills the email field from
`user.email`. Worth knowing: an employee filling this form while logged in puts **their own**
email on a customer's RFQ row.

### Hop 1 — the submit handler reads the form

`RequestQuotation.jsx:131-163`. Inputs are read three different ways in the same handler:

- Uncontrolled DOM lookup — `const val = (id) => form.querySelector('#' + id)?.value?.trim() || ''`
- Controlled React state — `email`, `phone`, `details`, `country`
- Derived values — `regionMeta`, `office`

### Hop 2 — the payload is composed

The exact object sent (`:139-156`):

```js
await submitPublicForm('/api/rfq', {
  name: val('name'),
  company: val('company'),
  email,
  phone: `${country?.dial || ''} ${phone || ''}`.trim(),
  country: country?.name || '',
  category: val('product'),
  message: [
    details,
    port ? `Port of destination: ${port}` : '',
    `Sales region: ${regionMeta.label} — handled by ${office.name}`,
  ]
    .filter(Boolean)
    .join('\n\n'),
});
```

Field-by-field, what the visitor sees vs what is stored:

| Visitor sees | Read from | JSON key | Column | Note |
|---|---|---|---|---|
| "Full Name" | `#name` (uncontrolled) | `name` | `rfq_requests.name` | straight through |
| "Company Name" | `#company` (uncontrolled) | `company` | `company` | straight through |
| Email | controlled state | `email` | `email` | straight through |
| Country dropdown + phone box | `country.dial` + `phone` | `phone` | `phone` | **fused into one string.** `"+971 501234567"`. Not parseable back apart |
| Country dropdown | `country.name` | `country` | `country` | the **display name** (`"United Arab Emirates"`), not an ISO code. Rename it in `countriesData.js` and old rows stop matching new ones |
| "Product Category" | `<select id="product">` | `category` | `category` | the `<option>`s have **no `value` attribute**, so the submitted string is the literal option text. Rename a product line and historical rows no longer match new ones |
| "Requirement Details" | controlled `details` | part 1 of `message` | `message` | |
| "Port of Destination" (export tab only) | `#port` | part 2 of `message` | `message` | prefixed `Port of destination: `, omitted when blank |
| — (derived from the region selector) | `regionMeta`, `office` | part 3 of `message` | `message` | always appended: `Sales region: <label> — handled by <office>` |

So the stored `message` looks like:

```
We need 400 tonnes of ringlock standards for a Q3 project.

Port of destination: Jebel Ali

Sales region: Middle East — handled by KEAA Gulf
```

**Port of destination and sales region exist only as prose inside a TEXT column.** They are not
separate fields, not filterable, not indexable, and not shown anywhere in the console.

### Hop 3 — the HTTP request

`src/data/adminApi.js:26-34`:

```js
export async function submitPublicForm(path, data) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Submission failed (${res.status})`);
  return res.json().catch(() => ({}));
}
```

`API_BASE` is `import.meta.env.VITE_ADMIN_API ?? 'http://localhost:8080'`, **inlined at build
time**. No cookies are sent. The request goes to `http://localhost:8080/api/rfq` — bypassing
the Vite proxy entirely, which is the point.

### Hop 4 — through Spring Security

1. **CORS preflight.** The browser sends `OPTIONS /api/rfq` because the request is cross-origin
   (5173 → 8080) with a non-simple `Content-Type`. `SecurityConfig.corsConfigurationSource()`
   answers using `app.cors.allowed-origin`, which is a **single** origin,
   `http://localhost:5173`. If the site is served from any other origin, this preflight fails
   and the form breaks with no server-side log. Section 4 fixes this.
2. **`JwtAuthFilter`** runs. No cookie → `readCookie` returns `null` → nothing set → chain
   continues. The request stays anonymous.
3. **Authorization.** `SecurityConfig.java:47`:
   `.requestMatchers(HttpMethod.POST, "/api/rfq", "/api/contact", "/api/careers").permitAll()`
   Matches. Note this is the **exact** path — `POST /api/rfq/` with a trailing slash is *not*
   covered and falls through to `.anyRequest().authenticated()`.

### Hop 5 — the controller

`com.keaa.adminapi.rfq.RfqController:23-28`:

```java
@PostMapping
public RfqRequest submit(@RequestBody RfqRequest req) {
    req.setId(null);
    req.setStatus("new");
    return rfqRepository.save(req);
}
```

Three things happen here and each matters:

- **Jackson binds straight onto the JPA entity.** There is no DTO. Any field on `RfqRequest` is
  settable from the request body unless the controller explicitly nulls it.
- `id` and `status` are nulled/forced — good.
- `createdAt` is **not**. `@Column(updatable=false)` constrains updates, not inserts, and
  `@PrePersist` only fills it `if (createdAt == null)`. So a caller can POST
  `{"createdAt":"2019-01-01T00:00:00Z"}` and forge the received-at timestamp, burying their
  submission at the bottom of a list sorted `findAllByOrderByCreatedAtDesc`. The frontend never
  does this; anyone with curl can.

There is **no `@Valid`, no `@NotBlank`, no email format check, no CAPTCHA, no rate limit.**

### Hop 6 — the database write

Hibernate issues an INSERT into `rfq_requests`. `@PrePersist` (`RfqRequest.java:40-43`) stamps
`createdAt` if it is still null. The row now exists:

```
id | name        | company        | email                | phone            | country | category                 | message   | status | created_at
7  | Ahmed Nasr  | Nasr Trading   | ahmed@nasr.example   | +971 501234567   | UAE     | Scaffolding & Formworks  | (TEXT...) | new    | 2026-07-20T09:14:02Z
```

### Hop 7 — the response, and what the visitor is told

`RfqController.submit` returns **the saved entity**, including its new `id`. That is a live
reference number the visitor could be given.

`RequestQuotation.jsx:157` does:

```js
setSubmitted(true);
```

The response body is **discarded**. The visitor never learns their RFQ reference. If you want
to show it, the id is already on the wire — read the resolved value of `submitPublicForm`.

On failure, `:158-159` catches with no binding and shows one fixed sentence: *"Could not submit
your request. Please try again, or email us directly."* Because the catch ignores the error,
**"the backend rejected your input" and "the backend is down" are indistinguishable to the
visitor** — and today the backend does no validation at all, so adding validation later will
surface as that same generic message.

### Hop 8 — the dashboard notices

`GET /api/dashboard/summary` → `DashboardController.summary()`:

```java
return new Summary(
        rfqRepository.countByStatus("new"),
        contactRepository.countByStatus("unread"),
        jobApplicationRepository.countByStatus("new"),
        productRepository.count(),
        userRepository.countByActiveTrue()
);
```

Record: `Summary(long openRfq, long unreadMessages, long newApplications, long products, long activeUsers)`.

`src/admin/pages/AdminDashboard.jsx:23-26` reads `summary.openRfq`, `unreadMessages`,
`newApplications`, `products` **by name** into four `StatCard`s. `activeUsers` is fetched and
thrown away. Rename any record component in Java and the tile silently renders `undefined` —
no error anywhere.

The counts are **exact string matches**. A status value with a typo silently stops being
counted.

### Hop 9 — the admin sees the row

`src/admin/pages/AdminRFQ.jsx:11` → `useApi('/api/rfq')` → `api.get('/api/rfq')` →
`fetch(API_BASE + '/api/rfq', { credentials: 'include' })`.

`JwtAuthFilter` reads `keaa_token`, verifies it, loads the user, checks `active`, grants
`ROLE_<role>`. `.anyRequest().authenticated()` lets it through — **any role, including
EMPLOYEE**.

`RfqController.all()` returns `findAllByOrderByCreatedAtDesc()` — the entities, so every field
including `email`, `phone` and the whole `message` blob is on the wire.

The table renders only seven columns (`AdminRFQ.jsx:25-39`):

| Column | Source |
|---|---|
| Ref | `r.id` |
| Contact | `r.name` |
| Company | `r.company` |
| Country | `r.country` |
| Category | `r.category` |
| Received | `(r.createdAt \|\| '').slice(0, 10)` |
| Status | `InquiryManager` status control |

**`email`, `phone` and `message` are never rendered.** Everything the visitor actually typed —
the requirement, the port, the region, how to contact them — is invisible in the console.
`DataTable` supports an `onRowClick` prop but no admin screen passes it, and there is no detail
modal. This is the single largest functional gap in the product today.

Note also that `Received` is string surgery on an ISO instant. If Jackson's serialization ever
changes to an epoch number, the column silently renders empty.

### Hop 10 — the admin changes the status

`AdminRFQ.jsx:15-23`:

```js
const changeStatus = async (id, status) => {
  setBusyId(id);
  try {
    await api.patch(`/api/rfq/${id}/status`, { status });
    setData((cur) => (cur || []).map((r) => (r.id === id ? { ...r, status } : r)));
  } finally {
    setBusyId(null);
  }
};
```

`PATCH /api/rfq/{id}/status` with `{"status":"quoted"}` → `RfqController.updateStatus` →
`r.setStatus(body.status())` → save → `UPDATE rfq_requests SET status='quoted' WHERE id=7`.

Three things to know:

- **The server accepts any string.** `StatusRequest` is an unvalidated record and the column is
  `varchar(20)`. The allowed values `new | in-review | quoted | closed` live only in
  `AdminRFQ.jsx:8` and in a Javadoc comment on the entity. A value over 20 characters throws a
  truncation error → 500.
- **There is no `catch`.** A rejected PATCH escapes as an unhandled promise rejection. `finally`
  still clears `busyId`, so the row quietly reverts and the admin is shown nothing.
- **The response body is discarded**, so if the server ever normalises the status the UI will
  not know.

The dashboard's `openRfq` tile drops by one on the next load, because the row no longer matches
`countByStatus("new")`.

That is the whole lifecycle.

---

## 4. Deploy hardening — do this before going live

Four files. Each block below is the **complete new file content**, not a diff. Replace the file
entirely.

**First, back up the backend.** It is not under version control.

```powershell
Copy-Item -Recurse "C:\Users\Web-Pc\IdeaProjects\keaa-admin-api" "C:\Users\Web-Pc\IdeaProjects\keaa-admin-api-backup-2026-07-20"
```

The design principle across all four: **every secret and every environment-specific value
becomes `${ENV_VAR:default}`, with the current value as the default.** Local development keeps
working exactly as it does now with no environment variables set. Production overrides them.

### 4.1 `application.properties` — REPLACES the existing file

Path: `c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\resources\application.properties`

**Why.** Today the MySQL root password, the JWT signing secret, and the CORS origin are all
plaintext in this file. Anyone who gets a copy can forge a `SUPER_ADMIN` token with no password
and no login record, and has full MySQL root on the host. Moving them to environment variables
means the file can be shared, copied and read without leaking anything.

**This file and the three Java files after it are one atomic change. Paste 4.1, 4.2, 4.3 and 4.4
together, or the application will not start:**

- `app.cors.allowed-origin` becomes `app.cors.allowed-origins` (plural, comma-separated) — read by
  4.3. Paste 4.1 without 4.3 and startup fails with
  `Could not resolve placeholder 'app.cors.allowed-origin'`; paste 4.3 without 4.1 and it fails on
  `'app.cors.allowed-origins'`.
- two new keys `app.jwt.cookie-secure` and `app.jwt.cookie-same-site` — read by 4.2.
- four new keys `app.seed.enabled`, `app.seed.admin-password`, `app.seed.sales-password`,
  `app.seed.hr-password` — read by 4.4. **Pasting 4.4 without 4.1 fails startup with
  `Could not resolve placeholder 'app.seed.enabled'`.**

All four, or none. There is no working intermediate state.

```properties
spring.application.name=keaa-admin-api
server.port=${SERVER_PORT:8080}

# =====================================================================
#  DATABASE
#  Every value below is ${ENV_VAR:default}. The defaults are the current
#  local-development values, so running this on your machine with no
#  environment variables set behaves exactly as it did before.
#
#  In production set DB_URL / DB_USERNAME / DB_PASSWORD and use a
#  dedicated MySQL account, NOT root. See the env var table in the guide.
# =====================================================================
spring.datasource.url=${DB_URL:jdbc:mysql://localhost:3306/keaa_admin?createDatabaseIfNotExist=true&serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false}
spring.datasource.username=${DB_USERNAME:root}
spring.datasource.password=${DB_PASSWORD:Devkeaa@6198}
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# ddl-auto=update creates tables and ADDS columns. It never drops, never
# renames, and never widens an existing column. See section 2 of the guide.
spring.jpa.hibernate.ddl-auto=${JPA_DDL_AUTO:update}
spring.jpa.open-in-view=false
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# =====================================================================
#  JWT
#  The default below is the old dev secret and is PUBLIC — it is in this
#  file, in git history of the guide, and base64-decodes to a readable
#  English sentence. It is fine for localhost and unacceptable anywhere
#  else. Set APP_JWT_SECRET in production.
#
#  Generate one:  openssl rand -base64 48
#  Must be base64 and decode to at least 32 bytes for HS256.
#
#  Changing the secret invalidates every cookie that is already out there.
#  Everyone signed in is logged out and signs in again once. That is the
#  entire cost, and you should pay it at the first production deploy.
# =====================================================================
app.jwt.secret=${APP_JWT_SECRET:a2VhYS1hZG1pbi1kZXYtc2VjcmV0LWtleS1jaGFuZ2UtbWUtaW4tcHJvZHVjdGlvbi0yMDI2}
app.jwt.expiration-days=${APP_JWT_EXPIRATION_DAYS:7}
app.jwt.cookie-name=${APP_JWT_COOKIE_NAME:keaa_token}

# ---------------------------------------------------------------------
#  Session cookie flags. These used to be hardcoded in AuthController.
#
#  cookie-secure    true  = the browser only ever sends the cookie over
#                           HTTPS. MUST be true in production.
#                   false = required for plain-http localhost dev.
#
#  cookie-same-site Lax   = correct when the site and the API are on the
#                           same registrable domain, e.g.
#                           www.keaa-international.net and
#                           api.keaa-international.net.
#                   None  = required when they are on DIFFERENT
#                           registrable domains, e.g. a Netlify/Vercel
#                           frontend calling an API on another domain.
#                           None WITHOUT Secure=true is rejected by every
#                           current browser — the cookie is silently
#                           dropped and login appears to succeed while
#                           every following request is anonymous.
#
#  Never set None unless you have also set cookie-secure=true.
# ---------------------------------------------------------------------
app.jwt.cookie-secure=${APP_JWT_COOKIE_SECURE:false}
app.jwt.cookie-same-site=${APP_JWT_COOKIE_SAME_SITE:Lax}

# =====================================================================
#  CORS — comma-separated list. Credentials are allowed, so the wildcard
#  "*" is illegal here (Spring throws at runtime when allowCredentials is
#  true). List the exact origins, including www and apex if you use both.
#
#  Production example:
#    APP_CORS_ALLOWEDORIGINS=https://www.keaa-international.net,https://keaa-international.net
#
#  No trailing slashes. An origin is scheme + host + port, nothing else.
# =====================================================================
app.cors.allowed-origins=${APP_CORS_ALLOWEDORIGINS:http://localhost:5173}

# =====================================================================
#  SEED DATA
#  DataSeeder only writes into a table that is completely empty, so it is
#  idempotent across restarts. In production set APP_SEED_ENABLED=false
#  once the real accounts exist, and never leave the default passwords in
#  place — the app logs a loud warning at startup if you do.
# =====================================================================
app.seed.enabled=${APP_SEED_ENABLED:true}
app.seed.admin-password=${APP_SEED_ADMIN_PASSWORD:admin123}
app.seed.sales-password=${APP_SEED_SALES_PASSWORD:sales123}
app.seed.hr-password=${APP_SEED_HR_PASSWORD:hr123}
```

### 4.2 `AuthController.java` — REPLACES the existing file

Path: `c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\auth\AuthController.java`

**Why.** `buildCookie()` currently hardcodes `.secure(false)` and `.sameSite("Lax")`. Neither
can be changed from configuration — someone has to edit Java on deploy day, which is exactly
when nobody wants to. `secure(false)` means the session cookie will travel over plain HTTP if
anything downgrades. Hardcoded `Lax` means the login will *appear* to work on a
different-domain deployment while every subsequent request comes back anonymous, with no error
message anywhere. **This is the most likely deployment-day failure in the whole project.**

Also fixed here: `DisabledException`. `CustomUserDetailsService` marks a deactivated user
`.disabled(true)`, and Spring checks that **before** comparing the password. `DisabledException`
is a sibling of `BadCredentialsException`, not a subclass, so today it escapes the `catch` and
the client gets a bare status with no `{"error":...}` body. `AdminAuthContext.jsx:47` maps
anything that is not 401 to `'unreachable'`, so **a deactivated employee is currently told the
server is down.** The version below catches it and returns a real message.

```java
package com.keaa.adminapi.auth;

import com.keaa.adminapi.security.JwtService;
import com.keaa.adminapi.user.User;
import com.keaa.adminapi.user.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;

/**
 * Login issues a JWT and sets it as an httpOnly cookie — the token never reaches JavaScript,
 * which is why the React admin uses fetch(..., { credentials: 'include' }) instead of an
 * Authorization header. Logout clears the cookie; /me returns the current profile.
 *
 * The cookie's Secure and SameSite flags come from configuration rather than being hardcoded,
 * because they have to differ between plain-http localhost and an https deployment, and
 * getting them wrong produces a login that succeeds and then silently forgets you.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.jwt.cookie-name}")
    private String cookieName;
    @Value("${app.jwt.expiration-days}")
    private long expirationDays;

    /** true in production (https only). false for plain-http localhost. */
    @Value("${app.jwt.cookie-secure}")
    private boolean cookieSecure;

    /**
     * "Lax" when the site and this API share a registrable domain.
     * "None" when they do not — and "None" REQUIRES cookie-secure=true, or every current
     * browser drops the cookie without telling anyone.
     */
    @Value("${app.jwt.cookie-same-site}")
    private String cookieSameSite;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req, HttpServletResponse response) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        } catch (DisabledException e) {
            // Spring checks "is this account enabled" BEFORE it compares the password, so this
            // fires even for a wrong password on a deactivated account. Without this branch it
            // escapes the controller entirely and the browser sees a body-less error, which the
            // React client reports to the user as "the server is unreachable".
            return ResponseEntity.status(403).body(new ErrorResponse("This account has been deactivated."));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid email or password."));
        }

        User user = userRepository.findByEmail(req.email()).orElseThrow();
        user.setLastActive(Instant.now());
        userRepository.save(user);

        String token = jwtService.generateToken(user);
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie(token, Duration.ofDays(expirationDays)).toString());
        return ResponseEntity.ok(UserResponse.from(user));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("", Duration.ZERO).toString());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        return userRepository.findByEmail(authentication.getName())
                .<ResponseEntity<?>>map(u -> ResponseEntity.ok(UserResponse.from(u)))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    private ResponseCookie buildCookie(String value, Duration maxAge) {
        return ResponseCookie.from(cookieName, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite)
                .maxAge(maxAge)
                .build();
    }

    // ---- DTOs ----
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record UserResponse(Long id, String name, String email, String role) {
        static UserResponse from(User u) {
            return new UserResponse(u.getId(), u.getName(), u.getEmail(), u.getRole().name());
        }
    }

    public record ErrorResponse(String error) {}
}
```

**Frontend note that goes with this.** `src/admin/auth/AdminAuthContext.jsx:47` classifies the
error as `'invalid'` only when `e.status === 401`. The new 403 for a deactivated account will
therefore still be reported as `'unreachable'`. If you want the real message shown, widen that
check — the backend now sends a proper `{"error":...}` body, which `client.js:27` already
surfaces as `err.message`.

### 4.3 `SecurityConfig.java` — REPLACES the existing file

Path: `c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\config\SecurityConfig.java`

**Why.** `config.setAllowedOrigins(List.of(allowedOrigin))` accepts **exactly one** origin.
Production will need at least the apex and `www`, and you will want staging too. With one slot
you cannot have them, and every call from the wrong origin fails the CORS preflight — the forms
break and the console cannot log in, with **no server-side log** because the browser blocks the
request before it is sent.

**Do not "fix" this with a wildcard.** `setAllowedOrigins(List.of("*"))` together with
`setAllowCredentials(true)` throws at runtime in Spring. The workaround people reach for,
`setAllowedOriginPatterns("*")`, reflects *any* origin with credentials — that is a full
cross-origin account-takeover primitive. An explicit list is the only correct answer.

```java
package com.keaa.adminapi.config;

import com.keaa.adminapi.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    /**
     * Comma-separated list of exact origins, e.g.
     *   https://www.keaa-international.net,https://keaa-international.net
     *
     * A wildcard is deliberately not supported. setAllowCredentials(true) below makes "*"
     * illegal in Spring (it throws at runtime), and the usual workaround —
     * setAllowedOriginPatterns("*") — reflects whatever Origin the caller sends back with
     * credentials allowed, which hands any website on the internet an authenticated session
     * against this API. List the origins explicitly.
     */
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults()) // uses the CorsConfigurationSource bean below
                .csrf(AbstractHttpConfigurer::disable) // stateless JWT API, no CSRF token
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // Public site forms submit these without logging in; reading and
                        // updating them still requires an authenticated admin.
                        .requestMatchers(HttpMethod.POST, "/api/rfq", "/api/contact", "/api/careers").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        if (origins.isEmpty()) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins is empty. Set APP_CORS_ALLOWEDORIGINS to a " +
                    "comma-separated list of exact origins, e.g. https://www.keaa-international.net");
        }

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // required so the browser sends the httpOnly cookie
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### 4.4 `DataSeeder.java` — REPLACES the existing file

Path: `c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\config\DataSeeder.java`

**Why.** Three admin passwords are hardcoded in Java and two of them are documented in a Javadoc
comment at the top of the file. `admin@keaa-international.net / admin123` is a three-word guess
against a SUPER_ADMIN account, and there is no rate limiting on login and no password-change
endpoint anywhere in the API. If this ships as-is, the console is open.

The version below reads the passwords from configuration, prints a loud multi-line warning at
startup when a default is still in use, and adds `app.seed.enabled` so you can turn seeding off
entirely once real accounts exist.

**Note:** the `count() == 0` guards are kept. That is what makes restarts idempotent, and it
also means **changing `APP_SEED_ADMIN_PASSWORD` after the users table already has rows does
nothing.** To change an existing password you need a password-reset endpoint (which does not
exist yet — see section 7) or direct SQL with a BCrypt hash.

```java
package com.keaa.adminapi.config;

import com.keaa.adminapi.career.JobApplication;
import com.keaa.adminapi.career.JobApplicationRepository;
import com.keaa.adminapi.contact.ContactMessage;
import com.keaa.adminapi.contact.ContactRepository;
import com.keaa.adminapi.product.Product;
import com.keaa.adminapi.product.ProductRepository;
import com.keaa.adminapi.rfq.RfqRepository;
import com.keaa.adminapi.rfq.RfqRequest;
import com.keaa.adminapi.user.Role;
import com.keaa.adminapi.user.User;
import com.keaa.adminapi.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Seeds first-run data so you can log in and every screen shows something. Each block only
 * runs when its table is empty, so restarting the app never duplicates or overwrites data.
 *
 * Seeded logins are configured, not hardcoded:
 *
 *   Super admin →  admin@keaa-international.net  /  ${APP_SEED_ADMIN_PASSWORD}
 *   Sales       →  sales@keaa-international.net  /  ${APP_SEED_SALES_PASSWORD}
 *   HR          →  hr@keaa-international.net     /  ${APP_SEED_HR_PASSWORD}
 *
 * Because the guard is "table is empty", changing a seed password after the users table has
 * rows in it does NOTHING. It only affects a first run against a fresh database.
 *
 * Set APP_SEED_ENABLED=false in production once the real accounts exist.
 */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    /** The values shipped as defaults. If any of these is still live, say so loudly. */
    private static final String DEFAULT_ADMIN_PASSWORD = "admin123";
    private static final String DEFAULT_SALES_PASSWORD = "sales123";
    private static final String DEFAULT_HR_PASSWORD = "hr123";

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final RfqRepository rfqRepository;
    private final ContactRepository contactRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled}")
    private boolean seedEnabled;

    @Value("${app.seed.admin-password}")
    private String adminPassword;
    @Value("${app.seed.sales-password}")
    private String salesPassword;
    @Value("${app.seed.hr-password}")
    private String hrPassword;

    @Override
    public void run(String... args) {
        warnAboutDefaultPasswords();

        if (!seedEnabled) {
            log.info("app.seed.enabled=false — skipping all seed data.");
            return;
        }

        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .name("Raveesh Moudgil").email("admin@keaa-international.net")
                    .password(passwordEncoder.encode(adminPassword)).role(Role.SUPER_ADMIN).active(true).build());
            userRepository.save(User.builder()
                    .name("Bhupesh Gautam").email("sales@keaa-international.net")
                    .password(passwordEncoder.encode(salesPassword)).role(Role.SALES).active(true).build());
            userRepository.save(User.builder()
                    .name("Priya Sharma").email("hr@keaa-international.net")
                    .password(passwordEncoder.encode(hrPassword)).role(Role.HR).active(true).build());
            log.info("Seeded 3 staff users (the users table was empty).");
        }

        if (productRepository.count() == 0) {
            productRepository.save(Product.builder().itemCode("KISF").name("Ringlock Tower")
                    .category("Scaffolding & Formworks").subcategory("System Scaffolds-Ringlock").build());
            productRepository.save(Product.builder().itemCode("KIRS").name("Ringlock Standard")
                    .category("Scaffolding & Formworks").subcategory("System Scaffolds-Ringlock").build());
            productRepository.save(Product.builder().itemCode("KI-FBH").name("Full Body Harness")
                    .category("Safety Products").subcategory("Personal Protective Equipment").build());
        }

        if (rfqRepository.count() == 0) {
            rfqRepository.save(RfqRequest.builder().name("Ahmed Al Mansoori").company("Al Mansoori Group")
                    .email("ahmed@almansoori.ae").country("UAE").category("Scaffolding & Formworks")
                    .message("Need a bulk quote for Cuplock scaffolding.").status("new").build());
            rfqRepository.save(RfqRequest.builder().name("Rajesh Kumar").company("BuildTech Constructors")
                    .email("rajesh@buildtech.in").country("India").category("Safety Products")
                    .message("Full body harnesses, quantity 200.").status("in-review").build());
        }

        if (contactRepository.count() == 0) {
            contactRepository.save(ContactMessage.builder().name("Wei Chen").email("wei.chen@sinobuild.cn")
                    .subject("Distributor partnership").message("We would like to distribute in China.").status("unread").build());
            contactRepository.save(ContactMessage.builder().name("Sara Kowalski").email("sara.k@polbud.pl")
                    .subject("Formwork technical specs").message("Please share EN specs.").status("read").build());
        }

        if (jobApplicationRepository.count() == 0) {
            jobApplicationRepository.save(JobApplication.builder().name("Neha Verma").email("neha.v@example.com")
                    .position("Production Engineer").experience("4 yrs").location("Ludhiana").status("new").build());
            jobApplicationRepository.save(JobApplication.builder().name("Rohit Singh").email("rohit.s@example.com")
                    .position("Export Sales Executive").experience("6 yrs").location("Remote").status("shortlisted").build());
        }
    }

    /**
     * Prints once per boot. It fires whether or not seeding actually ran, because the point is
     * the account that exists right now, not the account this run created.
     */
    private void warnAboutDefaultPasswords() {
        List<String> stillDefault = new ArrayList<>();
        if (DEFAULT_ADMIN_PASSWORD.equals(adminPassword)) stillDefault.add("APP_SEED_ADMIN_PASSWORD (admin@keaa-international.net, SUPER_ADMIN)");
        if (DEFAULT_SALES_PASSWORD.equals(salesPassword)) stillDefault.add("APP_SEED_SALES_PASSWORD (sales@keaa-international.net)");
        if (DEFAULT_HR_PASSWORD.equals(hrPassword)) stillDefault.add("APP_SEED_HR_PASSWORD (hr@keaa-international.net)");

        if (stillDefault.isEmpty()) return;

        log.warn("");
        log.warn("=========================================================================");
        log.warn("  INSECURE DEFAULT SEED PASSWORDS ARE IN USE");
        log.warn("=========================================================================");
        for (String s : stillDefault) {
            log.warn("    {}", s);
        }
        log.warn("");
        log.warn("  These values are published in the project guide and are guessable.");
        log.warn("  There is no login rate limiting, so they are directly brute-forceable.");
        log.warn("");
        log.warn("  Fix before this is reachable from the internet:");
        log.warn("    1. set the APP_SEED_* environment variables, and");
        log.warn("    2. set APP_SEED_ENABLED=false once the real accounts exist.");
        log.warn("");
        log.warn("  Note: changing a seed password does NOT change an account that already");
        log.warn("  exists — the seeder only writes into an empty table.");
        log.warn("=========================================================================");
        log.warn("");
    }
}
```

### 4.5 Every environment variable

| Variable | What it does | Dev default | Set in production to |
|---|---|---|---|
| `SERVER_PORT` | HTTP port Spring listens on | `8080` | whatever the host expects |
| `DB_URL` | Full JDBC URL including options | `jdbc:mysql://localhost:3306/keaa_admin?createDatabaseIfNotExist=true&serverTimezone=UTC&allowPublicKeyRetrieval=true&useSSL=false` | the production host, and **`useSSL=true`** for any non-localhost database. Drop `createDatabaseIfNotExist=true` once the schema exists |
| `DB_USERNAME` | MySQL user | `root` | a dedicated account, e.g. `keaa_app`, with rights only on `keaa_admin`. **Not root** |
| `DB_PASSWORD` | MySQL password | `Devkeaa@6198` | a new, unique password. The current one is in this document and must be treated as compromised |
| `JPA_DDL_AUTO` | Hibernate schema mode | `update` | `validate` once the schema is stable, so a code change can never silently alter production |
| `APP_JWT_SECRET` | HS256 signing key, base64, ≥32 bytes decoded | the published dev secret | `openssl rand -base64 48`. Changing it logs everyone out once |
| `APP_JWT_EXPIRATION_DAYS` | Token lifetime | `7` | `1` is a reasonable production value. Remember a role change does not take effect until the token expires |
| `APP_JWT_COOKIE_NAME` | Cookie name | `keaa_token` | leave as is |
| `APP_JWT_COOKIE_SECURE` | `Secure` flag | `false` | **`true`**. Always, on any https deployment |
| `APP_JWT_COOKIE_SAME_SITE` | `SameSite` flag | `Lax` | `Lax` if site and API share a registrable domain; `None` if they do not — and `None` requires `APP_JWT_COOKIE_SECURE=true` |
| `APP_CORS_ALLOWEDORIGINS` | Comma-separated exact origins | `http://localhost:5173` | e.g. `https://www.keaa-international.net,https://keaa-international.net`. No trailing slashes, no wildcard |
| `APP_SEED_ENABLED` | Whether `DataSeeder` runs at all | `true` | `true` on the FIRST production boot, then `false` — see the warning below |
| `APP_SEED_ADMIN_PASSWORD` | First-run SUPER_ADMIN password | `admin123` | a strong value — but only matters on a fresh database |
| `APP_SEED_SALES_PASSWORD` | First-run SALES password | `sales123` | as above |
| `APP_SEED_HR_PASSWORD` | First-run HR password | `hr123` | as above |

> **First production boot — order matters.** There is no way to create the first user without the
> seeder. `POST /api/users` is behind `.anyRequest().authenticated()` and there is no signup or
> password-reset endpoint. Against a fresh database:
>
> 1. Boot **once** with `APP_SEED_ENABLED=true` and strong `APP_SEED_ADMIN_PASSWORD` /
>    `APP_SEED_SALES_PASSWORD` / `APP_SEED_HR_PASSWORD`.
> 2. Confirm you can log in at `/admin/login` as `admin@keaa-international.net`.
> 3. Only then set `APP_SEED_ENABLED=false` and restart.
>
> If you set `APP_SEED_ENABLED=false` before step 2, the `users` table stays empty and the console
> is unreachable — the only way back in is inserting a row with a BCrypt hash by hand in MySQL.

These are **not** relaxed-binding names — the properties file at 4.1 spells each one out inside
the placeholder (`${APP_JWT_SECRET:...}`), so Spring looks up that exact environment variable
name. What you see in the table is literally what you set. If you add a key later, put the env var
name inside the placeholder the same way; a bare `${app.new.key}` has no environment override at
all.

Setting them in PowerShell for a one-off run:

```powershell
$env:APP_JWT_SECRET = "<new base64 value>"
$env:DB_PASSWORD = "<new db password>"
$env:APP_JWT_COOKIE_SECURE = "true"
$env:APP_CORS_ALLOWEDORIGINS = "https://www.keaa-international.net,https://keaa-international.net"
java -jar target\keaa-admin-api-0.0.1-SNAPSHOT.jar
```

Do **not** pass secrets as `--app.jwt.secret=...` command-line arguments — they end up visible
in the process list.

### 4.6 SameSite and Secure — read this twice

The two flags interact, and getting the combination wrong produces a failure that looks like
nothing at all: the login POST returns **200 with a user object**, the browser silently drops
the cookie, `GET /api/auth/me` immediately fails, and the user is bounced back to the login
screen with no error message.

| Deployment shape | SameSite | Secure | Works? |
|---|---|---|---|
| Local dev, both on `localhost` over http | `Lax` | `false` | Yes — this is the current default |
| Site `www.keaa-international.net`, API `api.keaa-international.net`, both https | `Lax` | **`true`** | Yes. Same registrable domain, so Lax is satisfied |
| Site on Netlify/Vercel, API on `keaa-international.net` | **`None`** | **`true`** | **Chrome/Firefox only.** Safari (ITP, default since 2020) and Brave block third-party cookies outright, so the cookie is never sent and the admin console is unusable on iOS/macOS. Do not ship this shape |
| Site and API on different domains | `None` | `false` | **No.** Every current browser rejects `SameSite=None` without `Secure`. Cookie dropped |
| Any https deployment | `Lax` or `Strict` | `false` | Works, but the cookie will be sent over any http downgrade. Do not do this. (With `None` see the row above — it does not work at all.) |

> **`SameSite=None` is not a portable answer.** It is the *minimum* required cross-site, not a
> guarantee: browsers that block third-party cookies by default (Safari, Brave) drop the cookie
> regardless. The only deployment shape that works in every browser is site and API on the **same
> registrable domain** — e.g. `www.keaa-international.net` + `api.keaa-international.net` — with
> `SameSite=Lax` and `Secure=true`. Treat that as a hard requirement when choosing where to host
> the API, not a preference.

There is also a security consequence. CSRF is disabled (`SecurityConfig` line
`.csrf(AbstractHttpConfigurer::disable)`), and the only thing preventing cross-site
state-changing requests today is `SameSite=Lax`. **The moment you set `SameSite=None`, every
endpoint becomes CSRF-exploitable.** If you need `None`, you also need to re-enable CSRF
protection or add an origin check. Prefer putting the API on a subdomain of the site's domain
so `Lax` keeps working.

### 4.7 The frontend side — `VITE_ADMIN_API`

`VITE_*` variables are **inlined by Vite at build time**. The string is baked into the emitted
JavaScript chunks. Editing `.env` on the server after deploy, or setting the variable in the
host's runtime environment, does **nothing**. It has to be present when `npm run build` runs.

Currently `.env` does not set it, so every build falls back to `http://localhost:8080`.
`.env.example` documents it.

What goes wrong if it is wrong:

| Mistake | Symptom |
|---|---|
| Unset in a production build | Every visitor's browser posts to `http://localhost:8080` — i.e. to their own machine. Either connection-refused, or whatever unrelated service they happen to run on 8080. **Completely silent server-side** because the request never leaves the visitor's machine. `/admin` is also unusable and the login screen shows the literal string "Is the backend running on port 8080?" |
| Set, but not matching `APP_CORS_ALLOWEDORIGINS` | Every call is blocked by the browser at the preflight. Forms fail, login fails. Also silent server-side |
| Trailing slash | Both call sites do naive `API_BASE + path`, producing `//api/rfq`. Spring will not match → 404 |
| Set to a relative value like `/api` | In dev the Vite proxy sends it to the Gemini chat server on 3001. Confusing failures unrelated to Spring |
| Changed after deploy | No effect. Rebuild required |

Only `src/data/adminApi.js` has a build-time guard (`console.error` on a production build with a
localhost base). `src/admin/api/client.js` has **no equivalent**, so a misbuilt admin console
fails with no diagnostic at all. Worth adding the same check there.

Correct production build:

```powershell
cd C:\Users\Web-Pc\Downloads\Code_base_keaa
$env:VITE_ADMIN_API = "https://api.keaa-international.net"
npm run build
```

---

## 5. Employees vs customers — the architecture

**This is a decision, already made with the client. It is NOT built yet.** Nothing described
here exists in the code today. Section 6 is the code to add when you want it.

### The question

Should company employees and ordinary public customers share one login system?

### The answer

**One Spring Boot service. Two identity domains.**

Separate the *identity* — tables, endpoints, cookies, token claims. Do **not** separate the
service or the repository.

|  | Employees (staff) | Customers (public) |
|---|---|---|
| Table | `users` | `customers` |
| Login endpoint | `POST /api/auth/login` | `POST /api/account/login` |
| Cookie name | `keaa_token` | `keaa_customer` |
| JWT claim | `typ=staff` | `typ=customer` |
| Filter | `JwtAuthFilter` | `CustomerAuthFilter` |
| Authority granted | `ROLE_SUPER_ADMIN` / `ROLE_HR` / `ROLE_EMPLOYEE` / `ROLE_SALES` | `ROLE_CUSTOMER` |
| Where they land | `/admin` | the customer portal |
| Exists today? | **Yes** | **No** |

### Why adding `CUSTOMER` to the `Role` enum is the wrong move

It is the smaller change, and that is exactly the problem. If `CUSTOMER` becomes a fifth value
in `com.keaa.adminapi.user.Role`:

- An anonymous internet stranger and the SUPER_ADMIN of the business live **in the same table,
  in the same row shape, with the same password column and the same login endpoint.**
- The only thing separating them is a string comparison on `role`. Every controller, every new
  endpoint, every future feature has to get that comparison right, forever. One forgotten check
  and a customer is in the admin console.
- The backend **currently has no method-level authorisation at all** (see section 7). Every
  authenticated request already reaches every endpoint. Adding `CUSTOMER` to the enum today
  would mean a self-registered customer could call `DELETE /api/users/{id}`. Not theoretically
  — literally, on the first day.
- `Role` is mirrored by hand in `src/admin/auth/roles.js`. A `CUSTOMER` value would immediately
  appear in the admin console's role dropdown, letting a SUPER_ADMIN accidentally demote a
  colleague into a customer.

### Why two cookie names

So both sessions can exist in one browser without evicting each other. An employee is allowed
to also hold a customer account — that is two identities and two logins, and the browser has
room for both.

### Why the `typ` claim

So the filter can reject a token presented at the wrong door **structurally**, not by trusting
that a role check was written correctly. A customer token sent to `/api/users` is not "a user
with the wrong role" — it is the wrong kind of credential entirely, and it should be rejected
before the database is even touched.

The boundary is drawn with `shouldNotFilter` on both filters, so the staff filter *physically
never runs* on `/api/account/**` and the customer filter *physically never runs* anywhere else.
Their relative order in the chain then does not matter, which removes a whole class of future
ordering bugs.

### Current state

The client has confirmed that public signup is **not wanted yet**. Only staff log in today.
Section 6 is the next step, ready to paste when they ask for it.

---

## 6. Adding customer accounts, when you want them

Everything in this section is **new work that does not exist yet**. Paste in the order given —
steps 3 and 4 are a matched pair and the code will not compile between them.

### Paste order

1. `application.properties` — the two new keys (6.1). `JwtService` will not start without them.
2. `Customer.java`, `CustomerRepository.java` (6.2) — NEW
3. `JwtService.java` (6.3) — REPLACES
4. `JwtAuthFilter.java` (6.4) — REPLACES
5. `CustomerAuthFilter.java` (6.5) — NEW
6. `SecurityConfig.java` (6.6) — REPLACES
7. `AccountController.java` (6.7) — NEW
8. `RfqRequest.java`, `RfqRepository.java`, `RfqController.java` (6.8) — REPLACES
9. `CustomerRfqController.java` (6.9) — NEW
10. Optional: `ApiExceptionHandler.java` (6.10) — NEW
11. Decide the token migration question (6.11)

Every file below assumes you have already applied section 4. If you have not, the
`AuthController` and `SecurityConfig` you paste in step 6 will not match what you have.

### 6.1 `application.properties` — ADD these keys

Add below the existing `app.jwt.cookie-same-site` line:

```properties
# =====================================================================
#  CUSTOMER IDENTITY DOMAIN
#  A SECOND cookie name so a staff session and a customer session can
#  coexist in one browser instead of evicting each other. Same signing
#  secret as the staff token — the JWT `typ` claim is what separates the
#  two domains, not the key.
#
#  Customers get a longer session than staff on purpose.
# =====================================================================
app.jwt.customer-cookie-name=${APP_JWT_CUSTOMER_COOKIE_NAME:keaa_customer}
app.jwt.customer-expiration-days=${APP_JWT_CUSTOMER_EXPIRATION_DAYS:30}
```

### 6.2 `Customer.java` and `CustomerRepository.java` — NEW files

`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\customer\Customer.java`

```java
package com.keaa.adminapi.customer;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/**
 * A public customer of the website — deliberately NOT a com.keaa.adminapi.user.User.
 *
 * Two identity domains, one service: staff live in `users` and sign in at /api/auth/login;
 * customers live here in `customers` and sign in at /api/account/login. The tables, the
 * endpoints, the cookie and the JWT `typ` claim are all separate, so a customer credential
 * is never one role comparison away from the admin console.
 *
 * `password` holds a BCrypt hash, never plaintext. Hibernate creates the table
 * automatically (ddl-auto=update) as `customers`.
 */
@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    /**
     * Unique within `customers` only. The same address may also exist in `users` — an
     * employee is allowed to hold a customer account. They are two identities and require
     * two logins; the two cookie names let both sessions coexist in one browser.
     */
    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String company;
    private String phone;
    private String country;

    /** Set false to lock an account out without deleting its RFQ history. */
    @Builder.Default
    private boolean active = true;

    private Instant lastActive;

    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
```

`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\customer\CustomerRepository.java`

```java
package com.keaa.adminapi.customer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Optional<Customer> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByActiveTrue();
}
```

### 6.3 `JwtService.java` — REPLACES the existing file

Path: `...\src\main\java\com\keaa\adminapi\security\JwtService.java`

`generateToken(User)` keeps its exact signature, so `AuthController` needs no edit.

```java
package com.keaa.adminapi.security;

import com.keaa.adminapi.customer.Customer;
import com.keaa.adminapi.user.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Signs and verifies the JWTs that travel in the httpOnly cookies.
 *
 * Both identity domains share one signing key; what separates them is the `typ` claim:
 *   typ=staff     issued by /api/auth/login,    carried in the keaa_token cookie
 *   typ=customer  issued by /api/account/login, carried in the keaa_customer cookie
 *
 * The claim exists so the filters can reject a token presented at the wrong door
 * structurally, instead of depending on a role check being written correctly in every
 * controller that is ever added.
 */
@Service
public class JwtService {

    public static final String CLAIM_TYPE = "typ";
    public static final String TYPE_STAFF = "staff";
    public static final String TYPE_CUSTOMER = "customer";

    private final SecretKey key;
    private final long expirationDays;
    private final long customerExpirationDays;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-days}") long expirationDays,
            @Value("${app.jwt.customer-expiration-days}") long customerExpirationDays) {
        this.key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
        this.expirationDays = expirationDays;
        this.customerExpirationDays = customerExpirationDays;
    }

    /** Staff token. Signature unchanged — AuthController needs no edit. */
    public String generateToken(User user) {
        return base(user.getEmail(), TYPE_STAFF, expirationDays)
                .claim("role", user.getRole().name())
                .claim("name", user.getName())
                .compact();
    }

    /** Customer token. Deliberately carries no `role` claim — customers have no Role. */
    public String generateCustomerToken(Customer customer) {
        return base(customer.getEmail(), TYPE_CUSTOMER, customerExpirationDays)
                .claim("name", customer.getName())
                .compact();
    }

    private JwtBuilder base(String subject, String type, long days) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(subject)
                .claim(CLAIM_TYPE, type)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(days, ChronoUnit.DAYS)))
                .signWith(key);
    }

    /** Throws if the token is invalid or expired. */
    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * The token's identity domain.
     *
     * STRICT MODE: a token with no `typ` is neither a staff token nor a customer token, so it
     * is rejected. That requires the signing secret to be rotated in the same deploy — see
     * section 6.11 of the guide for the alternative.
     */
    public String typeOf(Claims claims) {
        String type = claims.get(CLAIM_TYPE, String.class);
        return type == null ? "" : type;
    }
}
```

### 6.4 `JwtAuthFilter.java` — REPLACES the existing file

Path: `...\src\main\java\com\keaa\adminapi\security\JwtAuthFilter.java`

```java
package com.keaa.adminapi.security;

import com.keaa.adminapi.user.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Runs once per request: reads the JWT from the httpOnly cookie, verifies it, confirms the
 * user still exists and is active, and populates the SecurityContext. A missing or invalid
 * token simply leaves the request unauthenticated — the authorization rules then decide.
 *
 * This is the STAFF filter. It never runs on the customer door; see shouldNotFilter.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    @Value("${app.jwt.cookie-name}")
    private String cookieName;

    /**
     * The staff filter physically never runs on the customer door. That is the boundary:
     * not a role check that could be forgotten, but a filter that is not in the request's
     * path at all. Its mirror image lives in CustomerAuthFilter.
     *
     * getRequestURI() includes the servlet context path. This app runs with an empty context
     * path, so the literal prefix below is correct. If a context path is ever configured,
     * both filters' predicates must strip it or the boundary silently inverts.
     */
    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String uri = request.getRequestURI();
        return uri.equals("/api/account") || uri.startsWith("/api/account/");
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String token = readCookie(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = jwtService.parse(token);

                // A customer token presented at a staff endpoint is not "a user with the
                // wrong role" — it is the wrong kind of credential entirely. Reject before
                // the database is even touched.
                if (!JwtService.TYPE_STAFF.equals(jwtService.typeOf(claims))) {
                    filterChain.doFilter(request, response);
                    return;
                }

                String email = claims.getSubject();
                String role = claims.get("role", String.class);

                userRepository.findByEmail(email)
                        .filter(u -> u.isActive())
                        .ifPresent(u -> {
                            var auth = new UsernamePasswordAuthenticationToken(
                                    email, null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        });
            } catch (Exception ignored) {
                // invalid or expired token -> request stays unauthenticated
            }
        }

        filterChain.doFilter(request, response);
    }

    private String readCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (cookieName.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
```

### 6.5 `CustomerAuthFilter.java` — NEW file

`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\security\CustomerAuthFilter.java`

```java
package com.keaa.adminapi.security;

import com.keaa.adminapi.customer.CustomerRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * The mirror of JwtAuthFilter for the customer door. It runs ONLY on /api/account/**, reads
 * ONLY the keaa_customer cookie, and accepts ONLY a token whose typ claim is "customer".
 *
 * Note what is absent: there is no legacy fallback for a missing typ claim. JwtAuthFilter may
 * carry one during a migration window, because a claim-less token provably came from the staff
 * login. No such argument exists here, and a claim-less token must never become a customer.
 *
 * Because this filter and JwtAuthFilter are disjoint on path, their relative order in the
 * chain does not matter — which is exactly why the boundary was drawn with shouldNotFilter
 * rather than with an "is the context already populated" check.
 */
@Component
@RequiredArgsConstructor
public class CustomerAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final CustomerRepository customerRepository;

    @Value("${app.jwt.customer-cookie-name}")
    private String cookieName;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String uri = request.getRequestURI();
        return !(uri.equals("/api/account") || uri.startsWith("/api/account/"));
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        String token = readCookie(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = jwtService.parse(token);

                if (JwtService.TYPE_CUSTOMER.equals(jwtService.typeOf(claims))) {
                    String email = claims.getSubject();

                    customerRepository.findByEmail(email)
                            .filter(c -> c.isActive())
                            .ifPresent(c -> {
                                var auth = new UsernamePasswordAuthenticationToken(
                                        email, null,
                                        List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER")));
                                auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                                SecurityContextHolder.getContext().setAuthentication(auth);
                            });
                }
            } catch (Exception ignored) {
                // invalid or expired token -> request stays unauthenticated
            }
        }

        filterChain.doFilter(request, response);
    }

    private String readCookie(HttpServletRequest request) {
        if (request.getCookies() == null) return null;
        for (Cookie c : request.getCookies()) {
            if (cookieName.equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
```

### 6.6 `SecurityConfig.java` — REPLACES the version from section 4.3

```java
package com.keaa.adminapi.config;

import com.keaa.adminapi.security.CustomerAuthFilter;
import com.keaa.adminapi.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final CustomerAuthFilter customerAuthFilter;

    /** Comma-separated list of exact origins. See section 4.3 of the guide. */
    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults())
                .csrf(AbstractHttpConfigurer::disable) // stateless JWT API, no CSRF token
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // ---- staff door ----
                        .requestMatchers("/api/auth/**").permitAll()

                        // ---- customer door ----
                        // Registering and signing in are open. Logout is open too, so a
                        // cookie stays clearable from a dead session — but note this is the
                        // same forgeable-logout trade section 7 flags as MEDIUM for
                        // /api/auth/logout: a cross-site HTML form POST here will clear a
                        // customer's session (denial of service, not takeover). Accepted
                        // deliberately; revisit together with the staff endpoint if CSRF
                        // protection is restored.
                        // Order matters: these three sit ABOVE the catch-all below.
                        .requestMatchers(HttpMethod.POST,
                                "/api/account/register",
                                "/api/account/login",
                                "/api/account/logout").permitAll()
                        // Everything else customer-facing — /me, profile, own RFQs — needs a
                        // customer token. hasRole("CUSTOMER") matches the ROLE_CUSTOMER
                        // authority granted by CustomerAuthFilter, which only ever grants it
                        // for a typ=customer token. A staff token cannot reach here: the
                        // staff filter does not run on this path at all.
                        .requestMatchers("/api/account/**").hasRole("CUSTOMER")

                        // Public site forms submit these without logging in; reading and
                        // updating them still requires an authenticated admin.
                        .requestMatchers(HttpMethod.POST, "/api/rfq", "/api/contact", "/api/careers").permitAll()
                        .anyRequest().authenticated())
                .addFilterBefore(customerAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();

        if (origins.isEmpty()) {
            throw new IllegalStateException(
                    "app.cors.allowed-origins is empty. Set APP_CORS_ALLOWEDORIGINS to a " +
                    "comma-separated list of exact origins, e.g. https://www.keaa-international.net");
        }

        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

Consequences to expect:

- An admin with a valid `keaa_token` gets **403** on `/api/account/me`. That is intended —
  staff must not read customer-portal endpoints. When the admin console needs customer data,
  that is a **new staff-side** controller, e.g. `GET /api/customers`, landing under
  `.anyRequest().authenticated()`. Not in scope here; it is the obvious next ticket.
- The `permitAll` on register/login/logout is `HttpMethod.POST`-scoped, so a stray
  `GET /api/account/login` falls to `/api/account/**` → 403 rather than being open.

### 6.7 `AccountController.java` — NEW file

`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\customer\AccountController.java`

Customer passwords are verified manually rather than through `AuthenticationManager`. That is
deliberate: the single `AuthenticationManager` bean is wired to `CustomUserDetailsService`,
which reads `users`. Registering a second `AuthenticationProvider` would put both credential
stores in one provider chain, and Spring tries each in turn — a customer credential would be
offered to the staff provider and vice versa. That is exactly what the two-domain design
exists to prevent.

```java
package com.keaa.adminapi.customer;

import com.keaa.adminapi.security.JwtService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;

/**
 * /api/account — the CUSTOMER door. Mirrors AuthController's shape (httpOnly cookie, the
 * token never reaches JavaScript) but against the `customers` table, with its own cookie
 * name so a staff session and a customer session can coexist in one browser.
 */
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {

    /**
     * A valid BCrypt hash of a value nobody can supply. Compared against when the email is
     * unknown so a miss costs the same wall-clock time as a wrong password — otherwise the
     * endpoint becomes an account-enumeration oracle. (DaoAuthenticationProvider does the
     * same thing for staff; hand-rolled verification has to do it explicitly.)
     */
    private static final String DUMMY_HASH =
            "$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${app.jwt.customer-cookie-name}")
    private String cookieName;
    @Value("${app.jwt.customer-expiration-days}")
    private long expirationDays;

    /** Same flags as the staff cookie, from the same configuration. See section 4.6. */
    @Value("${app.jwt.cookie-secure}")
    private boolean cookieSecure;
    @Value("${app.jwt.cookie-same-site}")
    private String cookieSameSite;

    /** Public. Creates the account and signs them straight in. */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req,
                                      HttpServletResponse response) {
        String email = normalise(req.email());

        if (customerRepository.existsByEmail(email)) {
            return ResponseEntity.status(409)
                    .body(new ErrorResponse("An account with that email already exists."));
        }

        Customer customer = Customer.builder()
                .name(req.name().trim())
                .email(email)
                .password(passwordEncoder.encode(req.password()))
                .company(blankToNull(req.company()))
                .phone(blankToNull(req.phone()))
                .country(blankToNull(req.country()))
                .active(true)
                .lastActive(Instant.now())
                .build();

        try {
            customer = customerRepository.save(customer);
        } catch (DataIntegrityViolationException e) {
            // Two simultaneous registrations for the same address: the unique index is the
            // real guard, existsByEmail above is only the friendly path.
            return ResponseEntity.status(409)
                    .body(new ErrorResponse("An account with that email already exists."));
        }

        issueCookie(response, customer);
        return ResponseEntity.status(201).body(CustomerResponse.from(customer));
    }

    /** Public. */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req,
                                   HttpServletResponse response) {
        Customer customer = customerRepository.findByEmail(normalise(req.email())).orElse(null);

        if (customer == null) {
            passwordEncoder.matches(req.password(), DUMMY_HASH); // constant-ish time
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid email or password."));
        }
        if (!passwordEncoder.matches(req.password(), customer.getPassword())) {
            return ResponseEntity.status(401).body(new ErrorResponse("Invalid email or password."));
        }
        if (!customer.isActive()) {
            return ResponseEntity.status(403).body(new ErrorResponse("This account has been disabled."));
        }

        customer.setLastActive(Instant.now());
        customer = customerRepository.save(customer);

        issueCookie(response, customer);
        return ResponseEntity.ok(CustomerResponse.from(customer));
    }

    /** Public by design: clearing a cookie must work even from an expired session. */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildCookie("", Duration.ZERO).toString());
        return ResponseEntity.ok().build();
    }

    /** Authenticated (ROLE_CUSTOMER). */
    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        if (authentication == null) return ResponseEntity.status(401).build();
        return customerRepository.findByEmail(authentication.getName())
                .<ResponseEntity<?>>map(c -> ResponseEntity.ok(CustomerResponse.from(c)))
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    /** Authenticated. Profile edits only — email and password are deliberately not here. */
    @PutMapping("/me")
    public ResponseEntity<?> updateMe(Authentication authentication,
                                      @RequestBody UpdateProfileRequest req) {
        if (authentication == null) return ResponseEntity.status(401).build();
        return customerRepository.findByEmail(authentication.getName())
                .<ResponseEntity<?>>map(c -> {
                    if (req.name() != null && !req.name().isBlank()) c.setName(req.name().trim());
                    if (req.company() != null) c.setCompany(blankToNull(req.company()));
                    if (req.phone() != null) c.setPhone(blankToNull(req.phone()));
                    if (req.country() != null) c.setCountry(blankToNull(req.country()));
                    return ResponseEntity.ok(CustomerResponse.from(customerRepository.save(c)));
                })
                .orElseGet(() -> ResponseEntity.status(401).build());
    }

    // ---- helpers ----

    private void issueCookie(HttpServletResponse response, Customer customer) {
        String token = jwtService.generateCustomerToken(customer);
        response.addHeader(HttpHeaders.SET_COOKIE,
                buildCookie(token, Duration.ofDays(expirationDays)).toString());
    }

    private ResponseCookie buildCookie(String value, Duration maxAge) {
        return ResponseCookie.from(cookieName, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite(cookieSameSite)
                .maxAge(maxAge)
                .build();
    }

    private static String normalise(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }

    // ---- DTOs ----

    public record RegisterRequest(
            @NotBlank(message = "Name is required.") String name,
            @NotBlank @Email(message = "Enter a valid email address.") String email,
            @NotBlank @Size(min = 8, message = "Password must be at least 8 characters.") String password,
            String company,
            String phone,
            String country) {}

    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}

    public record UpdateProfileRequest(String name, String company, String phone, String country) {}

    /** Never carries the password hash. */
    public record CustomerResponse(Long id, String name, String email, String company,
                                   String phone, String country, Instant createdAt) {
        static CustomerResponse from(Customer c) {
            return new CustomerResponse(c.getId(), c.getName(), c.getEmail(), c.getCompany(),
                    c.getPhone(), c.getCountry(), c.getCreatedAt());
        }
    }

    public record ErrorResponse(String error) {}
}
```

**One asymmetry to be aware of.** `AccountController` lowercases emails; `AuthController` and
`UserController` do not. That is intentional here — self-service signup produces `Ahmed@…` and
`ahmed@…` from the same person — but it means the two tables have different case semantics.
Do **not** retrofit lowercasing onto `users`: the seeded hashes are keyed to the addresses as
stored, and MySQL's default collation already makes `findByEmail` case-insensitive there, so
the change would be cosmetic and risky.

### 6.8 RFQ ownership — three REPLACES

**`RfqRequest.java`** — REPLACES `...\src\main\java\com\keaa\adminapi\rfq\RfqRequest.java`

```java
package com.keaa.adminapi.rfq;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

/** A quotation request submitted from the public site's RFQ form. */
@Entity
@Table(name = "rfq_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RfqRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String company;
    private String email;
    private String phone;
    private String country;
    private String category;

    /**
     * Owning customer (customers.id), or null for an RFQ submitted by an anonymous visitor —
     * which is every RFQ that existed before customer accounts, and every one submitted from
     * the public form while logged out.
     *
     * Deliberately a plain Long and not a @ManyToOne Customer: RfqController returns this
     * entity directly as JSON, so a mapped association would serialise the whole Customer —
     * BCrypt hash included — into /api/rfq, and would throw on lazy access with
     * spring.jpa.open-in-view=false. A flat FK also matches the rest of this schema, which has
     * no JPA relationships anywhere.
     */
    @Column(name = "customer_id")
    private Long customerId;

    @Column(columnDefinition = "TEXT")
    private String message;

    /** new | in-review | quoted | closed */
    @Builder.Default
    @Column(length = 20)
    private String status = "new";

    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
```

**`RfqRepository.java`** — REPLACES `...\src\main\java\com\keaa\adminapi\rfq\RfqRepository.java`

```java
package com.keaa.adminapi.rfq;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RfqRepository extends JpaRepository<RfqRequest, Long> {
    List<RfqRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);

    /** The customer portal's "my quotation requests" list. Never returns unowned rows. */
    List<RfqRequest> findAllByCustomerIdOrderByCreatedAtDesc(Long customerId);
}
```

**`RfqController.java`** — REPLACES `...\src\main\java\com\keaa\adminapi\rfq\RfqController.java`

**This is the critical one.** `POST /api/rfq` is `permitAll` and binds the whole entity from the
request body. The moment `customerId` exists as a field, any anonymous visitor could post
`{"customerId": 3, ...}` and file an RFQ into someone else's account. It must be nulled
alongside `id` and `status`.

```java
package com.keaa.adminapi.rfq;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** /api/rfq — quotation requests. The public site POSTs here; admin reads + triages. */
@RestController
@RequestMapping("/api/rfq")
@RequiredArgsConstructor
public class RfqController {

    private final RfqRepository rfqRepository;

    @GetMapping
    public List<RfqRequest> all() {
        return rfqRepository.findAllByOrderByCreatedAtDesc();
    }

    /**
     * Public: the website's RFQ form posts here (no auth). Id, status and ownership are
     * server-controlled — this endpoint is permitAll, so anything a client sends for those
     * fields is discarded. An RFQ filed here is anonymous by definition; a signed-in customer
     * files theirs through POST /api/account/rfq instead, which sets the owner from the token
     * rather than from the body.
     */
    @PostMapping
    public RfqRequest submit(@RequestBody RfqRequest req) {
        req.setId(null);
        req.setStatus("new");
        req.setCustomerId(null);
        return rfqRepository.save(req);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<RfqRequest> updateStatus(@PathVariable Long id, @RequestBody StatusRequest body) {
        return rfqRepository.findById(id).map(r -> {
            r.setStatus(body.status());
            return ResponseEntity.ok(rfqRepository.save(r));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record StatusRequest(String status) {}
}
```

### 6.9 `CustomerRfqController.java` — NEW file

`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\customer\CustomerRfqController.java`

```java
package com.keaa.adminapi.customer;

import com.keaa.adminapi.rfq.RfqRepository;
import com.keaa.adminapi.rfq.RfqRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

/**
 * /api/account/rfq — a signed-in customer's OWN quotation requests.
 *
 * Sits under /api/account/** so it inherits the whole boundary for free: only
 * CustomerAuthFilter runs on this path, only a typ=customer token authenticates, and
 * SecurityConfig already requires hasRole("CUSTOMER").
 *
 * The owning customer is resolved from the token's subject on every call and never read from a
 * path variable or the request body — there is no id a caller could tamper with, so there is
 * no IDOR to get wrong.
 */
@RestController
@RequestMapping("/api/account/rfq")
@RequiredArgsConstructor
public class CustomerRfqController {

    private final RfqRepository rfqRepository;
    private final CustomerRepository customerRepository;

    /** GET /api/account/rfq — this customer's requests, newest first. */
    @GetMapping
    public ResponseEntity<?> mine(Authentication authentication) {
        Customer customer = current(authentication);
        if (customer == null) return ResponseEntity.status(401).build();

        List<RfqSummary> mine = rfqRepository
                .findAllByCustomerIdOrderByCreatedAtDesc(customer.getId())
                .stream()
                .map(RfqSummary::from)
                .toList();

        return ResponseEntity.ok(mine);
    }

    /** GET /api/account/rfq/{id} — one of this customer's requests, or 404 if not theirs. */
    @GetMapping("/{id}")
    public ResponseEntity<?> one(Authentication authentication, @PathVariable Long id) {
        Customer customer = current(authentication);
        if (customer == null) return ResponseEntity.status(401).build();

        return rfqRepository.findById(id)
                // 404 rather than 403 for someone else's RFQ: a 403 would confirm the row
                // exists, which is itself a small leak.
                .filter(r -> customer.getId().equals(r.getCustomerId()))
                .<ResponseEntity<?>>map(r -> ResponseEntity.ok(RfqSummary.from(r)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * POST /api/account/rfq — file a request as this customer. The owner, the contact details
     * and the status all come from the server side; the body supplies only what the customer
     * actually typed.
     */
    @PostMapping
    public ResponseEntity<?> submit(Authentication authentication, @Valid @RequestBody NewRfqRequest req) {
        Customer customer = current(authentication);
        if (customer == null) return ResponseEntity.status(401).build();

        RfqRequest saved = rfqRepository.save(RfqRequest.builder()
                .customerId(customer.getId())
                .name(customer.getName())
                .company(customer.getCompany())
                .email(customer.getEmail())
                .phone(customer.getPhone())
                .country(customer.getCountry())
                .category(req.category())
                .message(req.message())
                .status("new")
                .build());

        return ResponseEntity.status(201).body(RfqSummary.from(saved));
    }

    private Customer current(Authentication authentication) {
        if (authentication == null) return null;
        return customerRepository.findByEmail(authentication.getName()).orElse(null);
    }

    // ---- DTOs ----

    /**
     * A projection, not the entity. Keeps the customer portal's payload independent of the RFQ
     * table's shape, so an internal column added later (assigned rep, quoted price, margin
     * notes) is not exposed to customers by accident.
     */
    public record RfqSummary(Long id, String category, String message, String status, Instant createdAt) {
        static RfqSummary from(RfqRequest r) {
            return new RfqSummary(r.getId(), r.getCategory(), r.getMessage(), r.getStatus(), r.getCreatedAt());
        }
    }

    public record NewRfqRequest(@NotBlank String category, @NotBlank String message) {}
}
```

### 6.10 `ApiExceptionHandler.java` — NEW file, optional

`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api\src\main\java\com\keaa\adminapi\config\ApiExceptionHandler.java`

A bean-validation failure currently returns Spring's default error body, which has **no `error`
key**. Both React clients read `data.error`, so the user sees nothing useful. This turns those
into the shape the frontend already understands.

**It changes existing admin behaviour** — 400 responses from `/api/users` gain an `error` key.
That is strictly additive for the frontend (`client.js:27` already prefers `body.error`), but
know it before pasting.

```java
package com.keaa.adminapi.config;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;

/** Turns bean-validation failures into the {"error": "..."} shape the React clients read. */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> onInvalid(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .map(f -> f.getDefaultMessage())
                .orElse("Please check the form and try again.");
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
```

### 6.11 Staff tokens minted before the `typ` claim existed

Every staff token issued before this change is signed with the current secret, is valid for up
to 7 more days, and has **no `typ` claim**. With the strict `typeOf` in 6.3, those tokens no
longer authenticate: **every currently-signed-in admin is logged out** on their first request
after deploy. The frontend sees a failed `/api/auth/me`, `AdminAuthContext` clears, and they land
on the login screen. No error, no data loss — but it is a real, visible event.

Pick one deliberately.

**(A) Recommended — rotate the secret, strict from minute one.**
Set a fresh `APP_JWT_SECRET` in the same deploy. Every pre-existing token then fails signature
verification *before* `typ` is ever consulted, so there is no window in which a claim-less token
is accepted. Cost: everyone signs in once. Take it.

```powershell
# generate a new one
openssl rand -base64 48
```

**(B) Grace period — nobody is logged out, at the price of a 7-day soft spot.**
Replace the `typeOf` body in `JwtService` with:

```java
    public String typeOf(Claims claims) {
        String type = claims.get(CLAIM_TYPE, String.class);
        // Tokens minted before the typ claim existed are staff tokens by construction:
        // /api/auth/login was the only issuer at the time. Grace expires when the last
        // pre-change token does (app.jwt.expiration-days after deploy) — DELETE THIS
        // FALLBACK THEN and switch back to the strict form.
        return type == null ? TYPE_STAFF : type;
    }
```

Safe only because of a fact that is true once and never again: at the moment of the change,
`/api/auth/login` was the only token issuer, so a claim-less token provably came from the staff
door. **`CustomerAuthFilter` must never carry an equivalent fallback**, and the code in 6.5 has
no such branch. Set a calendar reminder to delete this; a "temporary" grace clause that survives
is how this kind of defence rots.

**(C) Permanent leniency.** Rejected — it makes `typ` advisory, which defeats the reason for
adding it.

### 6.12 The schema change and the existing rows

`ddl-auto=update` adds `customer_id BIGINT NULL` to `rfq_requests` on the next boot. Existing
rows get `NULL`. No manual step is needed in development. For a production run where DDL is
applied by hand:

```sql
ALTER TABLE rfq_requests
  ADD COLUMN customer_id BIGINT NULL;

-- findAllByCustomerIdOrderByCreatedAtDesc scans on this pair.
CREATE INDEX idx_rfq_customer_created ON rfq_requests (customer_id, created_at DESC);
```

**No foreign key constraint, deliberately.** `ddl-auto=update` will not create one, and adding
it by hand means deleting a customer would either fail or cascade away their quotation history
— commercial records the business wants to keep. Deactivation (`active = false`) is the intended
offboarding path. If a constraint is wanted later it must be `ON DELETE SET NULL`.

**Existing RFQs stay ownerless, permanently.** Every RFQ in the table today — the 2 seeded ones
plus everything the live public form has collected — has no owner and will keep none.
A customer who registers with the same email they used on the public form **will not** see their
historical requests. Their portal starts empty.

Say this to the client in plain words, because it will otherwise be reported as a bug.

The tempting alternative, documented so nobody reinvents it:

```sql
-- DO NOT RUN.
UPDATE rfq_requests r
  JOIN customers c ON c.email = r.email
   SET r.customer_id = c.id
 WHERE r.customer_id IS NULL;
```

`rfq_requests.email` is unverified free text typed into a public form. `customers.email` is
unverified too — registration sends no confirmation mail. So this statement gives whoever
registers `ahmed@almansoori.ae` first the full quotation history of the real Al Mansoori Group:
message bodies, categories, volumes, negotiation status. It turns an unauthenticated string
match into a data-disclosure primitive.

It is not safe until email verification exists at registration. Once it does, run it as an
explicit, logged, per-account claim at verification time — not as a bulk `UPDATE`.

If the client pushes for history-linking before verification, the honest middle path is an
admin-side action: a SUPER_ADMIN reviews and attaches specific historical RFQs to a specific
customer account by hand. Slow, but a human is accountable for each link. Offer that.

### 6.13 Frontend follow-ups (not built here)

The backend above is unusable without these:

- New `src/customer/api/client.js` mirroring `src/admin/api/client.js` — `credentials: 'include'`
  and the **absolute** `API_BASE`. A relative `/api/account/login` hits the Gemini chat server.
- `VITE_ADMIN_API` is inlined at build time. If the customer portal reuses it, it must be set
  before the production build.
- The customer session is a **different** React context from `AdminAuthContext`. Do not extend
  that provider — a shared context would put customer state in the object the admin console
  trusts, undoing at the UI layer exactly what `typ` establishes at the API layer.
- `DataSeeder` needs no change. If a demo customer is wanted, follow the existing
  `if (repository.count() == 0)` guard so restarts stay idempotent.

---

## 7. Security issues that are still open

Section 4 fixes secrets management, cookie flags and CORS. Everything below is **not** fixed by
this guide. Ranked by how bad it is.

### CRITICAL — there is no method-level authorisation at all

`SecurityConfig` has exactly three authorisation rules, and none of them mentions a role:

```java
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers(HttpMethod.POST, "/api/rfq", "/api/contact", "/api/careers").permitAll()
.anyRequest().authenticated()
```

`@PreAuthorize`, `@Secured`, `@RolesAllowed`, `hasRole`, `hasAuthority` appear **nowhere** in
`src/main/java`. `@EnableMethodSecurity` is **not present** — which also means that if someone
adds `@PreAuthorize` later, it will be **silently ignored** until that annotation is added.

Concretely, today:

- A logged-in **EMPLOYEE** — the lowest role — can call `POST /api/users {"role":"SUPER_ADMIN"}`
  and create themselves an admin account.
- Or `PUT /api/users/{theirOwnId} {"role":"SUPER_ADMIN"}` and promote themselves.
- Or `DELETE /api/users/{id}` for every other account.
- HR can delete the product catalogue. Sales can read every job application.

The comment at the top of `UserController` claims *"SUPER_ADMIN only (enforced by the route
being under the authenticated area)"*. **That claim is false.** The role model exists purely as
a label rendered by the frontend sidebar; the backend enforces nothing.

Related GDPR exposure, given the Dutch entity: `GET /api/careers` and `GET /api/rfq` return
every applicant's and every customer's name, email, phone and free-text message to **any**
authenticated staff member regardless of role.

**Fix:** add `@EnableMethodSecurity` to `SecurityConfig`, then `@PreAuthorize("hasRole('SUPER_ADMIN')")`
on `UserController`, and role rules per endpoint group in the filter chain. This is the single
most important outstanding item.

### CRITICAL — the database account is `root`

`spring.datasource.username=root`. The application runs with full MySQL privileges: it can
`DROP DATABASE`, read every other schema on that server, and use `FILE` privileges. Any SQL
injection or deserialization bug becomes total host compromise rather than a data-only incident.

Section 4 moves the password to an environment variable, which is necessary but not sufficient.
`createDatabaseIfNotExist=true` and `ddl-auto=update` both *require* elevated privileges as
currently written, so the real fix is a dedicated `keaa_app` account plus Flyway or Liquibase
for schema changes.

Also `useSSL=false` in the JDBC URL — fine on localhost, unacceptable to a remote database.

### HIGH — three unauthenticated, unvalidated, unthrottled write endpoints

`POST /api/rfq`, `/api/contact`, `/api/careers` accept the raw entity with **no `@Valid`, no
`@NotBlank`, no `@Size`, no email format check, no CAPTCHA, no rate limit.** CORS does not help
— it only constrains browsers, not a script.

`RfqRequest` has no non-null column at all, so `POST {}` writes an empty row. `message` and
`notes` are MySQL `TEXT` — 65,535 bytes each. A loop can insert unbounded rows until the disk
fills, and the admin inbox becomes unusable long before that.

These endpoints also return the persisted entity **including its new `id`**, giving an attacker
a live row counter.

### HIGH — no rate limiting, lockout, or audit logging on login

`POST /api/auth/login` accepts unlimited attempts against `admin@keaa-international.net`. BCrypt
at strength 10 caps throughput at roughly tens of guesses per second per core — meaningful, not
protection. Combined with the seeded `admin123`, this is directly exploitable.

**Nothing anywhere logs a failed or successful login.** There is no logger in the codebase at
all. There is no record of who changed a user's role, who deleted a record, or who read the
applicant list.

### HIGH — there is no way to change a password

`UpdateUserRequest` carries only `(name, role, active)`. There is no password-change endpoint,
no password-reset endpoint, and no self-service. A user **cannot** rotate their own password
even if they want to. Section 4's `DataSeeder` change only affects a first run against an empty
table; it cannot change an account that already exists.

Both a security hole and a functional gap. This needs building.

### HIGH — there is no password policy either

`UserController.CreateUserRequest` (`UserController.java:71-75`) constrains `password` with
`@NotBlank` and nothing else. No minimum length, no complexity rule, no server-side check at all.
`POST /api/users` with `"password":"a"` creates a working staff account. Any client-side check in
`AdminUsers.jsx` is not a control — the API is reachable directly.

This stacks badly with the two entries above it: a one-character password is set once, cannot be
rotated (there is no endpoint), and can be brute-forced without limit (there is no throttle).

Note the asymmetry with section 6.7: customer registration enforces `@Size(min = 8)`. Staff
accounts — the ones that can delete the user table — enforce nothing.

**Fix:** add `@Size(min = 12, message = "Password must be at least 12 characters.")` to
`CreateUserRequest.password`, and apply the same constraint to the password-change endpoint when
it is built.

### MEDIUM — CSRF is disabled and only `SameSite=Lax` is holding the line

`.csrf(AbstractHttpConfigurer::disable)`. Today that is *mostly* adequate — Lax withholds the
cookie from cross-site POST/PUT/PATCH/DELETE, and there is no state-changing `GET`. But the
protection is incidental, and it **evaporates the moment `SameSite` is set to `None`** to make a
cross-domain deployment work, which section 4.6 makes a realistic path. If that happens, every
endpoint becomes CSRF-exploitable at once.

Login CSRF is not exploitable: `/api/auth/login` requires `Content-Type: application/json`,
which an HTML form cannot produce and a cross-origin `fetch` cannot send without a preflight
that CORS rejects.

### MEDIUM — logout can be forged

`POST /api/auth/logout` is `permitAll` (matched by `/api/auth/**`), takes no body, requires no
CSRF token, and needs no valid session. A page the victim visits can auto-submit
`<form action="http://<api>/api/auth/logout" method="POST">` — an HTML form POST is not subject
to CORS preflight, and the response's `Set-Cookie: keaa_token=; Max-Age=0` is applied by the
browser. Impact is denial of service (repeated forced logout), not account takeover. Fix: require
authentication on logout, and/or restore CSRF protection. Section 6.6 makes
`POST /api/account/logout` `permitAll` for the same reason, so if you build the customer portal,
fix both endpoints together.

### MEDIUM — the login endpoint tells an anonymous caller whether an account exists

Section 4.2 adds a `DisabledException` catch returning **403 "This account has been
deactivated."** Spring performs the enabled-state check *before* comparing the password, so that
403 is returned for **any** password, including a wrong one. An unauthenticated attacker can
therefore probe addresses and learn which are real staff accounts that happen to be deactivated —
with no credential and, per the HIGH entry above, no rate limit.

This is a deliberate trade: without it a deactivated employee is told "the server is unreachable"
(`AdminAuthContext.jsx:47` maps every non-401 to `'unreachable'`), which generates support
tickets. Note the inconsistency with section 6.7, which goes to some length (`DUMMY_HASH`) to
avoid exactly this on the customer door.

**If you prefer no disclosure over the better message:** delete the `DisabledException` branch's
403 and fall through to the same `401 {"error":"Invalid email or password."}` as
`BadCredentialsException`. Deactivated staff then see the generic message, which is the standard
trade-off. **If you keep the 403:** login rate limiting stops being optional — it is the only
thing bounding how fast the oracle can be queried.

### MEDIUM — role changes take up to 7 days to take effect

`JwtAuthFilter` derives the authority from the **token claim**, while reading `active` from the
database. A demoted SUPER_ADMIN keeps SUPER_ADMIN authority until their token expires. With a
7-day expiry, no refresh mechanism and no revocation list, that is a real window.

Two-line fix: read the role from the loaded `User` rather than from the claim.

### MEDIUM — logout is client-side only, tokens cannot be revoked

`AuthController.logout` just overwrites the cookie. There is no server-side revocation list, so
a token captured before logout stays valid for the rest of its 7 days. If a laptop is lost,
there is no way to kill that session short of deactivating the user or rotating the signing
secret (which logs everyone out).

### LOW/MEDIUM — `createdAt` can be forged on every public endpoint

The public POSTs null only `id` and `status`. `@Column(updatable=false)` constrains updates, not
inserts, and `@PrePersist` only fills `createdAt` if it is null. So anyone can post
`{"createdAt":"2019-01-01T00:00:00Z"}` and bury their submission at the bottom of a list ordered
by `createdAt DESC`. `POST /api/products` has the same exposure to any authenticated user.

### LOW — unbounded page size

`GET /api/products` takes `size` with a default of 15 but **no ceiling**. `?size=1000000`
materialises the whole table. Authenticated-only, so low. Fix with `@Max`.

### LOW — status values are not validated

All three `PATCH /{id}/status` endpoints write `body.status()` verbatim with no whitelist check.
A typo silently corrupts the dashboard counters, which count by exact string match. A value over
20 characters throws a truncation error → 500.

### LOW — self-lockout is possible and unguarded

`DELETE /api/users/{id}` will happily delete the only SUPER_ADMIN, or the caller's own account.
`PUT` will set `active=false` on the last admin. Since `DataSeeder` only reseeds when the table
is **empty**, deleting the last admin while other users remain leaves the console permanently
unenterable without direct SQL.

Also `deleteById` on a missing id is a silent no-op that still returns **204**, so the UI cannot
distinguish "deleted" from "was never there".

### LOW — predictable 500s from unvalidated input

`Role.valueOf(req.role())` throws `IllegalArgumentException` on any string outside the enum → a
500 with a body the frontend renders as `"Request failed (500)"`. `POST /api/products` without
`name` → `DataIntegrityViolationException` → 500. There is no `@ControllerAdvice` anywhere
(6.10 adds a partial one). Boot's default `include-stacktrace=never` means this leaks the
exception type and path but not a stack trace.

### INFO — `spring-boot-devtools` is on the classpath

Boot disables devtools automatically when the app runs from a repackaged jar, so this is not a
production RCE risk as packaged. But it must **not** be run in production via `spring-boot:run`
or an exploded classpath.

### Confirmed good

`UserDto` projects only `(id, name, email, role, active, lastActive)` — the BCrypt hash is never
serialised. `AuthController.UserResponse` is narrower still. This the codebase gets
unambiguously right.

### Two things to verify live

The backend was not running when this was written, so these two depend on Spring runtime
behaviour and could not be confirmed from source:

1. **What status code does an unauthenticated call to a protected endpoint return?** There is no
   `authenticationEntryPoint`, no `exceptionHandling` configuration, no `formLogin` and no
   `httpBasic`. With no authentication mechanism registered, Spring Security's default entry
   point is `Http403ForbiddenEntryPoint`, so **403 is expected, not 401** — but the frontend is
   written against 401 (`AdminAuthContext.jsx:47` treats anything that is not 401 as "backend
   unreachable"). Confirm with:
   ```powershell
   curl.exe -i http://localhost:8080/api/users
   ```
2. **What does a deactivated user's login return?** Section 4.2's `AuthController` adds a
   `DisabledException` catch that should make this a clean 403 with a message. Confirm by
   deactivating a user and running:
   ```powershell
   curl.exe -i -X POST http://localhost:8080/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"hr@keaa-international.net\",\"password\":\"wrong\"}"
   ```

Both change what you should write in the frontend's error handling.

---

## 8. Runbook

All commands are for **PowerShell** on Windows. `mvnw.cmd` shells out to `powershell -noprofile`
so it must be run from PowerShell or cmd — **not Git Bash**.

Note: in PowerShell 5.1, `curl` is an alias for `Invoke-WebRequest`. Use **`curl.exe`** for
everything below, or the flags will not work.

### 0. Back up the backend (do this before pasting anything)

```powershell
Copy-Item -Recurse "C:\Users\Web-Pc\IdeaProjects\keaa-admin-api" "C:\Users\Web-Pc\IdeaProjects\keaa-admin-api-backup-$(Get-Date -Format yyyy-MM-dd)"
```

### 1. Prerequisites

```powershell
# JAVA_HOME is unset on this machine. Maven falls back to java on PATH (Temurin 25),
# but set it explicitly to avoid toolchain surprises.
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot"
java -version

# MySQL must be listening on 3306. Check the service:
Get-Service -Name "MySQL*"
```

The schema `keaa_admin` is created automatically on first boot by
`createDatabaseIfNotExist=true`. `mysql` is not on PATH here; MySQL Shell is, at
`C:\Program Files\MySQL\MySQL Shell 8.0\bin`.

### 2. Start the backend (terminal 1)

```powershell
cd C:\Users\Web-Pc\IdeaProjects\keaa-admin-api
.\mvnw.cmd spring-boot:run
```

First run downloads Maven 3.9.16 (`distributionType=only-script` in
`maven-wrapper.properties`) — needs internet, takes about a minute.

To build a jar instead:

```powershell
.\mvnw.cmd clean package -DskipTests
java -jar target\keaa-admin-api-0.0.1-SNAPSHOT.jar
```

**`-DskipTests` is not optional unless MySQL is running.** The only test,
`KeaaAdminApiApplicationTests.contextLoads`, is a full `@SpringBootTest` that boots the whole
context and fails if MySQL is unreachable or the credentials are wrong. There is no H2 or
Testcontainers fallback. (`@SpringBootTest` DOES run `CommandLineRunner` beans —
`SpringBootContextLoader` calls `SpringApplication.run()`, which calls `callRunners()`. So a test
run executes `DataSeeder` against the configured database. Against a fresh/empty database that
seeds the default-password accounts. Never build with tests enabled while production database
credentials are in the environment, and set `APP_SEED_ENABLED=false` before any build on a
production host.)

If 8080 is taken: `$env:SERVER_PORT = "8081"` — and remember `VITE_ADMIN_API` is inlined at
build time, so the React app has to be rebuilt to follow.

### 3. Start the frontend (terminal 2)

```powershell
cd C:\Users\Web-Pc\Downloads\Code_base_keaa
npm install          # first time only
npm run dev:all      # Vite on 5173 + the Gemini chat server on 3001
```

`npm run dev` alone starts only Vite. Neither starts Spring Boot.

### 4. Health checks

```powershell
# Backend reachable at all — expect a JSON error or a 401/403, NOT a connection refusal.
curl.exe -i http://localhost:8080/api/auth/me

# Protected endpoint with no cookie. Note the status code — see section 7.
curl.exe -i http://localhost:8080/api/users

# Public form endpoint. Should return 200 and a JSON body with an id.
curl.exe -i -X POST http://localhost:8080/api/rfq -H "Content-Type: application/json" -d "{\"name\":\"Health Check\",\"email\":\"test@example.com\",\"category\":\"Scaffolding & Formworks\",\"message\":\"ignore\"}"

# Frontend
curl.exe -i http://localhost:5173/
```

If the RFQ POST returns 200, delete the row afterwards so it does not sit in the admin inbox.

### 5. Verify a login end to end, and confirm the cookie was set

```powershell
curl.exe -i -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"admin@keaa-international.net\",\"password\":\"admin123\"}"
```

**What to look for in the response headers.** You should see a line like:

```
Set-Cookie: keaa_token=eyJhbGciOiJIUzI1NiJ9....; Path=/; Max-Age=604800; Expires=...; HttpOnly; SameSite=Lax
```

Check each part:

> **Before section 4 is applied**, `Secure` and `SameSite` are hardcoded in
> `AuthController.buildCookie()` (`.secure(false)`, `.sameSite("Lax")`), so
> `APP_JWT_COOKIE_SECURE` and `APP_JWT_COOKIE_SAME_SITE` do nothing — expect `SameSite=Lax` and
> no `Secure`, whatever you set. The two rows below describe the behaviour **after** 4.1 + 4.2 are
> pasted.

| Look for | Means |
|---|---|
| `keaa_token=` followed by a long token | Login succeeded, the JWT was issued |
| `HttpOnly` | JavaScript cannot read the token. Correct |
| `Path=/` | Sent on every path. Correct |
| `Max-Age=604800` | 7 days, matching `app.jwt.expiration-days` |
| `SameSite=Lax` | Before section 4: hardcoded at `AuthController.java:80`. After section 4: matches `app.jwt.cookie-same-site` |
| **`Secure`** | Before section 4: **never present** — `AuthController.java:78` hardcodes `.secure(false)`. After section 4: present only when `APP_JWT_COOKIE_SECURE=true`. If it is absent in production, stop and fix it |

The body should be `{"id":1,"name":"Raveesh Moudgil","email":"admin@keaa-international.net","role":"SUPER_ADMIN"}`.

**Now prove the cookie actually works.** Save it to a jar and reuse it:

```powershell
# Log in and save the cookie
curl.exe -c "$env:TEMP\keaa-cookies.txt" -X POST http://localhost:8080/api/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"admin@keaa-international.net\",\"password\":\"admin123\"}"

# Inspect the jar — you should see a keaa_token line
Get-Content "$env:TEMP\keaa-cookies.txt"

# Use it against a protected endpoint. 200 + a user array means the whole loop works.
curl.exe -i -b "$env:TEMP\keaa-cookies.txt" http://localhost:8080/api/auth/me
curl.exe -i -b "$env:TEMP\keaa-cookies.txt" http://localhost:8080/api/users
curl.exe -i -b "$env:TEMP\keaa-cookies.txt" http://localhost:8080/api/dashboard/summary

# Log out, then confirm /me stops working
curl.exe -i -b "$env:TEMP\keaa-cookies.txt" -c "$env:TEMP\keaa-cookies.txt" -X POST http://localhost:8080/api/auth/logout
curl.exe -i -b "$env:TEMP\keaa-cookies.txt" http://localhost:8080/api/auth/me

# Clean up — that file contains a live session token
Remove-Item "$env:TEMP\keaa-cookies.txt"
```

**Verifying it in the browser instead** (this is what matters for a real deployment, because
only the browser enforces `SameSite` and `Secure`):

1. Open the site, press F12, go to the **Network** tab.
2. Log in at `/admin/login`.
3. Click the `login` request. Under **Response Headers**, find `Set-Cookie`. If there is a
   warning triangle next to it, the browser **rejected** the cookie — hover it for the reason.
   That is the failure mode described in section 4.6.
4. Go to **Application → Storage → Cookies**. `keaa_token` should be listed against the API's
   origin, with `HttpOnly` ticked.
5. Click the next request (`/api/auth/me`). Under **Request Headers**, confirm a `Cookie:
   keaa_token=...` line is present. **If step 3 looked fine but this line is missing, the cookie
   was set but is not being sent** — that is a `SameSite` problem.

### 6. Inspecting the database

MySQL Shell is at `C:\Program Files\MySQL\MySQL Shell 8.0\bin`. Using it in SQL mode:

```powershell
& "C:\Program Files\MySQL\MySQL Shell 8.0\bin\mysqlsh.exe" --sql --user=root --host=localhost --port=3306 --schema=keaa_admin
```

Then:

```sql
SHOW TABLES;
SELECT id, name, email, role, active, last_active FROM users;
SELECT id, name, company, country, category, status, created_at FROM rfq_requests ORDER BY created_at DESC LIMIT 10;
SELECT id, name, email, subject, status, created_at FROM contact_messages ORDER BY created_at DESC LIMIT 10;
SELECT id, name, position, experience, location, status FROM job_applications ORDER BY created_at DESC LIMIT 10;
SELECT COUNT(*) FROM products;
```

Note the column names are snake_case in MySQL (`last_active`, `created_at`, `item_code`,
`resume_url`, `image_url`) — Hibernate's default naming strategy converts the camelCase Java
field names.

To read the full stored `message` of an RFQ — which the admin console never shows:

```sql
SELECT message FROM rfq_requests WHERE id = 7\G
```

### 7. Production build of the frontend

```powershell
cd C:\Users\Web-Pc\Downloads\Code_base_keaa
$env:VITE_ADMIN_API = "https://api.keaa-international.net"
npm run build
```

Then verify the value actually got baked in:

```powershell
Select-String -Path "dist\assets\*.js" -Pattern "api.keaa-international.net" | Select-Object -First 1
```

If that returns nothing, the variable was not set when the build ran. Rebuild. If you find
`localhost:8080` in there instead, the same thing happened and **every public form will fail
silently for every visitor.**

---

## Uncertainties in this document

Stated here rather than buried:

- The HTTP status for an unauthenticated call to a protected endpoint is **expected to be 403**
  (default `Http403ForbiddenEntryPoint`), but the frontend is written against 401. Verified only
  by reading configuration, not against a running server. Command to confirm is in section 7.
- The `DisabledException` behaviour on a deactivated account (Spring checks enabled-state before
  comparing the password) is standard `AbstractUserDetailsAuthenticationProvider` behaviour but
  was not exercised live. Section 4.2 handles it either way.
- Section 6 is design work. It has been written against the real conventions and imports of this
  codebase, but **it has never been compiled**. Expect to fix a small thing on first build.
- The `openssl` command for generating a secret assumes `openssl` is on PATH. It ships with Git
  for Windows at `C:\Program Files\Git\usr\bin\openssl.exe` if the bare name does not resolve.
- The JDK path in section 8 (`C:\Program Files\Eclipse Adoptium\jdk-25.0.3.9-hotspot`) is from
  the audit of this machine. Confirm it with `Get-ChildItem "C:\Program Files\Eclipse Adoptium"`
  before relying on it.
