# SOP / Help system — backend (enterprise upgrade)

Makes the Contextual Help + SOP content **database-driven and version-controlled**, so a Super
Admin or Senior Admin edits a guide in one place and every surface (dashboard SOP card, help
drawer, SOP manager) updates. The frontend already reads toward this: `src/admin/help/useSop.js`
is the single swap point, and `src/admin/components/SopHelpManager.jsx` is the editor.

Everything here lives in the Spring Boot project **`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api`**
(package `com.keaa.adminapi.sop`). **These edits have already been applied and compile clean**
(`./mvnw.cmd -o compile` → BUILD SUCCESS). This file documents what changed and how to run it.

> The project is not in git. A backup was taken at `keaa-admin-api-backup` in the earlier round;
> take a fresh copy before any further change.

## What changed in this round

The original schema carried only `title, purpose, checklist, workflow, important`. The enterprise
help model adds the full **8-section** structure plus display metadata, so the guide object is now:

| Field | Type | Notes |
| --- | --- | --- |
| `department` | String | Administration / Business Development / HR / Website / General. Drives the manager's filter and a chip in the drawer header. |
| `workflow` | List&lt;String&gt; | Ordered pipeline stages, rendered as a vertical stepper. |
| `responsibilities` | List&lt;String&gt; | Ongoing duties. |
| `checklist` | List&lt;String&gt; | Do-today actions (the dashboard card previews these). |
| `bestPractices` | List&lt;String&gt; | Operational best practice. |
| `important` | List&lt;String&gt; | The rules that bite if ignored. |
| `quickTips` | List&lt;String&gt; | Short, high-value tips. |
| `related` | List&lt;String&gt; | Related module keys, rendered as jump-to chips. |
| `updatedBy` | String | Display name of whoever last published. |
| `version` | Integer | Bumps on every publish; 1 when seeded. Column is `doc_version` (avoids the MySQL reserved word `VERSION`); the JSON field stays `version`. |

`SopRevision` gained the same list fields plus **`changeSummary`** (the note the editor typed), so
version history shows who changed what, when, and why.

All list fields are stored as JSON in a `TEXT` column via the existing `StringListConverter`, so
the entity keeps real `List<String>` fields and the API returns real arrays. New columns are created
automatically by `ddl-auto=update`.

### Files touched (all in `com.keaa.adminapi.sop` unless noted)

- **`Sop.java`** — added `department`, `responsibilities`, `bestPractices`, `quickTips`, `related`,
  `updatedBy`, `version` (`@Column(name = "doc_version")`); `onCreate()` defaults `version` to 1.
- **`SopRevision.java`** — added the same list fields plus `changeSummary`.
- **`SopController.java`** — the `PutMapping` now snapshots **all** fields (with `changeSummary`),
  writes the new values back, sets `updatedBy` from the authenticated editor, and bumps `version`.
  The DTO is now:
  ```java
  public record SopRequest(String title, String department, String purpose,
                           List<String> workflow, List<String> responsibilities,
                           List<String> checklist, List<String> bestPractices,
                           List<String> important, List<String> quickTips,
                           List<String> related, String changeSummary) {}
  ```
- **`config/DataSeeder.java`** — the seed block was replaced with the **rich 14-guide content**
  (6 role SOPs: Super Admin, Senior Admin, Admin, Business Development, HR, Employee; 8 module
  guides: rfq, export-inquiries, contacts, applications, users, roles, products, reports). This
  mirrors `src/admin/help/sopContent.js` exactly. The old per-page guides for simple pages
  (product-categories, media, videos, downloads, profile, notifications, guides) were dropped:
  the enterprise model gives dedicated help only to workflow-intensive modules.

`StringListConverter.java`, `SopRepository.java`, `SopRevisionRepository.java`, and the
`SecurityConfig` matchers are unchanged from the first round.

## Restore is a normal save (no new endpoint)

"Restore a previous version" is implemented **without** a new endpoint: the SOP manager PUTs the
chosen revision's content back through `PUT /api/sops/{id}` with a `changeSummary` of
"Restored the version from …". Because every PUT snapshots the version it replaces, the restore is
itself captured in history. This keeps the API surface small and the audit trail complete.

## How access is gated (unchanged)

No `@PreAuthorize` anywhere; the `SecurityConfig` URL matcher already added in the first round
gates it: **any signed-in user reads** guides, **only Super Admin / Senior Admin write** them.
```java
.requestMatchers(HttpMethod.GET, "/api/sops/**").authenticated()
.requestMatchers("/api/sops/**").hasAnyRole("SUPER_ADMIN", "SENIOR_ADMIN")
```

## Run it (Windows, from the backend folder)

```powershell
cd c:\Users\Web-Pc\IdeaProjects\keaa-admin-api
.\mvnw.cmd -o compile          # BUILD SUCCESS (already verified)
.\mvnw.cmd spring-boot:run      # boots on :8080; ddl-auto=update adds the new columns + seeds the rich guides
```

Verify with an admin cookie from a normal login:
- `GET http://localhost:8080/api/sops` → 14 rows, every field populated, arrays intact, `version: 1`.
- `PUT /api/sops/{id}` as a Business Development user → **403** (URL matcher).
- `PUT /api/sops/{id}` as Super Admin → 200; `version` bumps; `GET /api/sops/{id}/revisions` shows
  the replaced version with its `changeSummary`.

## Frontend behaviour if the backend is not running

The frontend never blocks on the API. `useSop.js` falls back to `src/admin/help/sopContent.js`
(the rich content mirrored above), so the dashboard SOP card and every help drawer still render.
The SOP manager shows the same content read-only with a banner explaining that editing, publishing
and version history need the backend. Once the backend is up and seeded, editing, versioning and
restore all work and every surface refreshes live after a save.
