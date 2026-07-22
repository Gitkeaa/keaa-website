# SOP / Help system — backend (paste-in)

Makes the Contextual Help content **database-driven**, so a Super Admin edits a guide in one
place and every surface (dashboard SOP card, help drawer) updates. This is the piece the
frontend already reads toward: `src/admin/help/useSop.js` is the single swap point.

Everything here goes in the Spring Boot project **`c:\Users\Web-Pc\IdeaProjects\keaa-admin-api`**.
It is not under version control — **copy the folder first**. The code matches the conventions
already in that project (Lombok builders, `Instant` timestamps, TEXT columns, derived-query
repositories, nested-record DTOs, URL-matcher authorization).

## How access is gated — no method security needed

This backend does **not** use `@EnableMethodSecurity` / `@PreAuthorize` anywhere; every write is
gated by a URL matcher in `SecurityConfig`, exactly like `/api/products/**`. We follow that
pattern: **any signed-in user reads** guides, **only Super Admin / Senior Admin write** them.
Nothing else in the security model changes.

## Data model — two new tables (auto-created by `ddl-auto=update`)

| Table | Holds |
| --- | --- |
| `sops` | One row per guide. `scope` = `role` or `page`; `refKey` = the role name (`BUSINESS_DEVELOPMENT`) or the module key (`rfq`). Content in `title`, `purpose`, and three JSON-text lists. |
| `sop_revisions` | A snapshot of the PREVIOUS content every time a guide is saved — who changed it and when. Your version history. |

The array fields (`checklist`, `workflow`, `important`) are stored as JSON in a TEXT column via a
small converter, so the entity keeps real `List<String>` fields and the API returns real arrays —
the exact shape the frontend already uses.

---

## New package: `com.keaa.adminapi.sop`

Create a `sop/` folder next to `product/`, `inquiry/`, etc., with these six files.

### 1. `StringListConverter.java` — NEW

```java
package com.keaa.adminapi.sop;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Collections;
import java.util.List;

/** Stores a List<String> as a JSON string in a TEXT column, and back. Jackson ships with
 *  Spring Boot, so there is no new dependency. */
@Converter
public class StringListConverter implements AttributeConverter<List<String>, String> {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(List<String> list) {
        try {
            return list == null ? null : MAPPER.writeValueAsString(list);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<String> convertToEntityAttribute(String json) {
        if (json == null || json.isBlank()) return Collections.emptyList();
        try {
            return MAPPER.readValue(
                    json, MAPPER.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
```

### 2. `Sop.java` — NEW

```java
package com.keaa.adminapi.sop;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "sops",
        uniqueConstraints = @UniqueConstraint(name = "uq_sop_scope_ref", columnNames = {"scope", "refKey"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sop {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** "role" or "page". */
    @Column(nullable = false, length = 8)
    private String scope;

    /** scope="role" → a Role name (BUSINESS_DEVELOPMENT); scope="page" → a module key (rfq). */
    @Column(nullable = false, length = 48)
    private String refKey;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> checklist;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> workflow;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> important;

    @Column(updatable = false)
    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        if (createdAt == null) createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
```

### 3. `SopRevision.java` — NEW

```java
package com.keaa.adminapi.sop;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "sop_revisions", indexes = @Index(name = "idx_soprev_sop", columnList = "sopId"))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SopRevision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sopId;

    @Column(length = 120)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String purpose;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> checklist;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> workflow;

    @Convert(converter = StringListConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> important;

    /** Display name of whoever saved this version (matches the InquiryActivity.updatedBy idiom). */
    private String editedBy;

    @Column(updatable = false)
    private Instant createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }
}
```

### 4. `SopRepository.java` — NEW

```java
package com.keaa.adminapi.sop;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SopRepository extends JpaRepository<Sop, Long> {
    Optional<Sop> findByScopeAndRefKey(String scope, String refKey);
}
```

### 5. `SopRevisionRepository.java` — NEW

```java
package com.keaa.adminapi.sop;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SopRevisionRepository extends JpaRepository<SopRevision, Long> {
    List<SopRevision> findBySopIdOrderByCreatedAtDesc(Long sopId);
}
```

### 6. `SopController.java` — NEW

```java
package com.keaa.adminapi.sop;

import com.keaa.adminapi.user.User;
import com.keaa.adminapi.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Reads are open to any signed-in user (everyone needs their guides); writes are restricted to
 * Super Admin / Senior Admin by the URL matcher in SecurityConfig. Every save snapshots the
 * version it replaces into sop_revisions.
 */
@RestController
@RequestMapping("/api/sops")
@RequiredArgsConstructor
public class SopController {

    private final SopRepository sopRepository;
    private final SopRevisionRepository revisionRepository;
    private final UserRepository userRepository;

    /** The whole set, loaded once by the frontend; it picks the role/page rows it needs. */
    @GetMapping
    public List<Sop> list() {
        return sopRepository.findAll();
    }

    @GetMapping("/{id}/revisions")
    public List<SopRevision> revisions(@PathVariable Long id) {
        return revisionRepository.findBySopIdOrderByCreatedAtDesc(id);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody SopRequest body, Authentication auth) {
        return sopRepository.findById(id).map(sop -> {
            User editor = userRepository.findByEmail(auth.getName()).orElseThrow();

            // Snapshot the version we are about to overwrite.
            revisionRepository.save(SopRevision.builder()
                    .sopId(sop.getId())
                    .title(sop.getTitle())
                    .purpose(sop.getPurpose())
                    .checklist(sop.getChecklist())
                    .workflow(sop.getWorkflow())
                    .important(sop.getImportant())
                    .editedBy(editor.getName())
                    .build());

            sop.setTitle(body.title());
            sop.setPurpose(body.purpose());
            sop.setChecklist(body.checklist());
            sop.setWorkflow(body.workflow());
            sop.setImportant(body.important());
            return ResponseEntity.ok(sopRepository.save(sop));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ---- DTOs ----
    public record SopRequest(String title, String purpose,
                             List<String> checklist, List<String> workflow, List<String> important) {}
}
```

---

## Edit: `config/SecurityConfig.java` — REPLACE the two lines above `.anyRequest()`

Inside `authorizeHttpRequests(...)`, immediately **before** `.anyRequest().authenticated()`, add:

```java
                    // SOP / Help guides: everyone signed in reads; only the top tiers edit.
                    .requestMatchers(HttpMethod.GET, "/api/sops/**").authenticated()
                    .requestMatchers("/api/sops/**").hasAnyRole("SUPER_ADMIN", "SENIOR_ADMIN")
```

Order matters (first match wins) — the `GET` line must sit above the general `/api/sops/**` line,
the same shape as the `/api/products/**` rules already there. No other change to this file.

---

## Edit: `config/DataSeeder.java` — seed the guides once

Inject the repository with the other `private final` fields at the top of the class:

```java
    private final SopRepository sopRepository;
```

Then add this block inside `run(...)`, next to the other `count() == 0` seed blocks. It mirrors
`src/admin/help/sopContent.js` — once this runs, the database is the source of truth and that
frontend file becomes only a fallback.

```java
        if (sopRepository.count() == 0) {
            // ---- role SOPs (dashboard card + "complete SOP") ----
            sopRepository.save(Sop.builder().scope("role").refKey("BUSINESS_DEVELOPMENT")
                    .title("Business Development SOP")
                    .purpose("Turn every assigned inquiry into a closed Won or Lost outcome.")
                    .checklist(List.of(
                            "Check new RFQs assigned to you",
                            "Contact the customer within 24 hours",
                            "Send the quotation",
                            "Keep every status updated",
                            "Close the inquiry as Won or Lost"))
                    .important(List.of(
                            "Do not skip a status — move through the workflow in order.",
                            "A Lost inquiry requires a reason.",
                            "Every action is logged."))
                    .build());

            sopRepository.save(Sop.builder().scope("role").refKey("HR")
                    .title("HR SOP")
                    .purpose("Move every applicant cleanly from application to offer or rejection.")
                    .checklist(List.of(
                            "Review new applications",
                            "Schedule interviews",
                            "Update each candidate’s status",
                            "Upload interview feedback",
                            "Send the offer or the rejection"))
                    .important(List.of(
                            "Keep a candidate’s status current — it is what the rest of the team sees.",
                            "Record a reason when you reject, for a fair and auditable trail."))
                    .build());

            sopRepository.save(Sop.builder().scope("role").refKey("EMPLOYEE")
                    .title("Employee SOP")
                    .purpose("Read-only access to the dashboard for visibility.")
                    .checklist(List.of(
                            "Review the dashboard overview",
                            "Raise anything that needs action with your desk lead"))
                    .important(List.of("Your access is read-only — you cannot change records."))
                    .build());

            // The three admin tiers share one SOP — seed a row per role so each is editable.
            for (String adminRole : List.of("SUPER_ADMIN", "SENIOR_ADMIN", "ADMIN")) {
                sopRepository.save(Sop.builder().scope("role").refKey(adminRole)
                        .title("Admin SOP")
                        .purpose("Oversee every desk and keep the site and its data healthy.")
                        .checklist(List.of(
                                "Review pending approvals and new inquiries",
                                "Manage employees and their assigned territories",
                                "Publish and update website content",
                                "Review reports across departments",
                                "Monitor that each desk is clearing its queue"))
                        .important(List.of(
                                "Only Super Admin and Senior Admin can change roles and permissions.",
                                "Every create, edit and delete is logged against your account."))
                        .build());
            }

            // ---- page guides (help drawer), keyed by the module key in roles.js ----
            sopRepository.save(Sop.builder().scope("page").refKey("rfq")
                    .title("RFQ Guide")
                    .purpose("Manage the customer RFQs assigned to you.")
                    .workflow(List.of("New", "Contacted", "Quotation Sent", "Negotiation", "Won / Lost", "Closed"))
                    .important(List.of("Do not skip a status.", "A Lost deal requires a reason.", "Every action is logged."))
                    .build());

            sopRepository.save(Sop.builder().scope("page").refKey("export-inquiries")
                    .title("Export Inquiries Guide")
                    .purpose("Handle export enquiries from overseas buyers, the same way as an RFQ.")
                    .workflow(List.of("New", "Contacted", "Quotation Sent", "Negotiation", "Won / Lost", "Closed"))
                    .important(List.of("Confirm the destination port and country before quoting.", "A Lost enquiry requires a reason."))
                    .build());

            sopRepository.save(Sop.builder().scope("page").refKey("contacts")
                    .title("Contact Messages Guide")
                    .purpose("Read and resolve general enquiries sent through the Contact page.")
                    .workflow(List.of("Unread", "Read", "Replied", "Closed"))
                    .important(List.of("Mark a message Read once you have opened it.",
                            "Convert a genuine buying enquiry into an RFQ rather than closing it here."))
                    .build());

            sopRepository.save(Sop.builder().scope("page").refKey("applications")
                    .title("Job Applications Guide")
                    .purpose("Move candidates from application through to a hiring decision.")
                    .workflow(List.of("New", "Shortlisted", "Interview", "Offer", "Hired / Rejected"))
                    .important(List.of("Keep each candidate’s status current.", "Record a reason when rejecting."))
                    .build());

            sopRepository.save(Sop.builder().scope("page").refKey("users")
                    .title("User Management Guide")
                    .purpose("Create team members, set their role, and assign territory.")
                    .important(List.of(
                            "A user’s role decides which modules they see — set it carefully.",
                            "Assigned countries and categories route inquiries to Business Development automatically.",
                            "Only Super Admin and Senior Admin can manage users."))
                    .build());

            sopRepository.save(Sop.builder().scope("page").refKey("products")
                    .title("Products Guide")
                    .purpose("Keep the public catalogue accurate — add, edit and organise products.")
                    .important(List.of("Item codes are shown to customers — keep them correct.",
                            "Business Development has read-only access here."))
                    .build());

            sopRepository.save(Sop.builder().scope("page").refKey("roles")
                    .title("Roles & Permissions Guide")
                    .purpose("Define what each role can see and do across the panel.")
                    .important(List.of("A permission change takes effect the next time that user signs in.",
                            "Only Super Admin and Senior Admin can reach this screen."))
                    .build());
        }
```

---

## Apply, build, run (Windows, from the backend folder)

```powershell
# 1. Back up first — this project is not in git.
Copy-Item -Recurse "c:\Users\Web-Pc\IdeaProjects\keaa-admin-api" "c:\Users\Web-Pc\IdeaProjects\keaa-admin-api-backup"

# 2. Add the six sop/ files + the two edits above, then:
.\mvnw.cmd -q compile          # should compile clean
.\mvnw.cmd spring-boot:run      # boots on :8080, ddl-auto=update creates the two tables + seeds
```

Verify (with an admin cookie from a normal login):
- `GET http://localhost:8080/api/sops` → the seeded rows, arrays intact.
- `PUT /api/sops/{id}` as a Business Development user → **403** (URL matcher working).
- `PUT /api/sops/{id}` as Super Admin → 200, and `GET /api/sops/{id}/revisions` shows the old version.

---

## Then — the frontend (I build this once the endpoints are live)

Two changes, both in the working-directory repo, so I can apply them directly:

1. **`src/admin/help/useSop.js`** — fetch `/api/sops` once on admin load, cache it, and fall back
   to `sopContent.js` if the backend is unreachable. The three exported readers keep the same
   signatures, so no component changes. (`sopContent.js` stays as the offline fallback.)
2. **Guide Management page** — `src/admin/pages/AdminGuides.jsx` (Super Admin edits a guide,
   sees its revision history), a `guides` entry in `roles.js` `MODULES`, its route in `App.jsx`,
   and a `BookOpen` icon in `adminIcons.js`.

Tell me once the backend is applied and running, and I will wire the frontend against the live
endpoints and verify with a build.
