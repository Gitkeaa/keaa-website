# Backend: store applicant resumes on Cloudinary

Drop-in spec for the **`keaa-admin-api`** Spring Boot repo (package `com.keaa.adminapi`), which is
separate from this frontend. Once applied, HR can preview and download every applicant's CV in the
admin ATS. **No further frontend change is needed** (the client already sends the file and is
Cloudinary-ready).

---

## Current state (why download does not work yet)
- `POST /api/careers` accepts only JSON today. A multipart (CV) POST returns **403**, so the client
  falls back to JSON and `resumeUrl` is saved as `''` (see `BACKEND_GUIDE.md` lines 302, 310-315).
- **Cloudinary is already in the stack** (gallery images upload via `/api/gallery/image` and come
  back as a Cloudinary asset). Reuse the same Cloudinary account and credentials for resumes.

## What the frontend already sends (do NOT change the client)
`src/data/adminApi.js` `submitPublicFormWithFile` posts `multipart/form-data` to `POST /api/careers`
with two parts:
- **`payload`** (`application/json`) — the same object the JSON path sends (`name, email, phone,
  position, experience, location, resumeUrl:'', notes`).
- **`resume`** — the file (PDF / DOC / DOCX, max 5 MB).

The goal: on the multipart request, upload `resume` to Cloudinary and put its URL in `resumeUrl`.

---

## Backend changes

### 1. Cloudinary dependency (already present if gallery upload works)
`pom.xml`:
```xml
<dependency>
  <groupId>com.cloudinary</groupId>
  <artifactId>cloudinary-http44</artifactId>
  <version>1.39.0</version>
</dependency>
```

### 2. Cloudinary bean (skip if you already have one for gallery)
```java
package com.keaa.adminapi.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
  @Bean
  Cloudinary cloudinary(@Value("${cloudinary.cloud-name}") String cloud,
                        @Value("${cloudinary.api-key}") String key,
                        @Value("${cloudinary.api-secret}") String secret) {
    return new Cloudinary(ObjectUtils.asMap(
        "cloud_name", cloud, "api_key", key, "api_secret", secret, "secure", true));
  }
}
```

### 3. Resume upload service
```java
package com.keaa.adminapi.careers;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class ResumeStorage {
  private final Cloudinary cloudinary;
  public ResumeStorage(Cloudinary cloudinary) { this.cloudinary = cloudinary; }

  /** Upload a CV to Cloudinary as a RAW asset (PDF/doc, not an image) and return its https URL. */
  public String upload(MultipartFile file) throws IOException {
    Map<?, ?> res = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
        "resource_type", "raw",           // PDF / DOCX are raw, not images
        "folder", "keaa/resumes",
        "use_filename", true,
        "unique_filename", true,
        "overwrite", false));
    return (String) res.get("secure_url");
  }
}
```

### 4. Accept multipart on `POST /api/careers`
Split the endpoint by `consumes`: keep the JSON handler, add a multipart one. In `CareerController`:
```java
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

// inject these into the controller:
//   private final ObjectMapper objectMapper;
//   private final ResumeStorage resumeStorage;

// existing JSON handler — just pin its consumes so both can coexist:
@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
public Career createJson(@RequestBody Career c) {
  return repo.save(c);                    // no CV, or the frontend's JSON fallback
}

// NEW: multipart handler (applicant attached a CV)
@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public Career createMultipart(@RequestPart("payload") String payloadJson,
                              @RequestPart(value = "resume", required = false) MultipartFile resume)
    throws IOException {
  Career c = objectMapper.readValue(payloadJson, Career.class);
  if (resume != null && !resume.isEmpty()) {
    c.setResumeUrl(resumeStorage.upload(resume));   // Cloudinary URL lands in resumeUrl
  }
  return repo.save(c);
}
```
The `Career` entity's `resumeUrl` is already `varchar(1000)` — **no schema change**. (Optionally add a
`resumeName` column for the original filename.)

### 5. `application.properties`
```properties
# multipart limits (the client already caps the file at 5 MB)
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=6MB

# same Cloudinary account the gallery already uses
cloudinary.cloud-name=${CLOUDINARY_CLOUD_NAME}
cloudinary.api-key=${CLOUDINARY_API_KEY}
cloudinary.api-secret=${CLOUDINARY_API_SECRET}
```
Set the three `CLOUDINARY_*` env vars on the server. Never commit the secret.

### 6. Security (the 403 you see today)
`POST /api/careers` is already `permitAll()` in `SecurityConfig` (`BACKEND_GUIDE.md` ~line 981). The
multipart POST 403s only because there is no multipart handler to match it; adding step 4 resolves
it. Keep CSRF disabled for `/api/**` (it already is, since the JSON POST returns 200) and leave the
default multipart resolver enabled.

---

## Download / preview (already handled on the frontend)
- Cloudinary raw URLs open inline. The frontend's **Download** rewrites the URL with `fl_attachment`
  so it downloads instead of opening, and the **preview** iframe already trusts `res.cloudinary.com`.
  Nothing else to configure.
- The moment `resumeUrl` is a real Cloudinary URL, the ATS row shows the resume icon and the profile
  shows preview + Open + Download.

## GDPR note (resumes are personal data)
`GET /api/careers` returns applicant data and is flagged for GDPR exposure in `BACKEND_GUIDE.md`
(~line 2589). Consider Cloudinary's EU region and keep `keaa/resumes` private / served via
authenticated (signed) URLs rather than public delivery, so a leaked URL is not a data breach.

## Verify end to end
1. Submit the public careers form **with a PDF resume**.
2. Backend: the new row's `resumeUrl` is `https://res.cloudinary.com/<cloud>/raw/upload/.../keaa/resumes/....pdf`.
3. Admin ATS (`/admin/careers`) → the applicant's row shows the resume icon; open the profile → PDF
   preview renders, and **Open** + **Download** both work.
