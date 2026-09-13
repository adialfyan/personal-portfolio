# 03 — Database ERD

## Entity Relationship Diagram

```mermaid
erDiagram
    AUTH_USERS ||--o| ADMIN_USERS : authorized_as
    ADMIN_USERS ||--o{ PROJECTS : creates
    PROFILE ||--o{ SOCIAL_LINKS : has
    PROJECTS ||--o{ PROJECT_TECHNOLOGIES : uses
    TECHNOLOGIES ||--o{ PROJECT_TECHNOLOGIES : assigned_to
    PROJECTS ||--o{ PROJECT_LINKS : has
    PROJECTS ||--o{ PROJECT_MEDIA : contains

    AUTH_USERS {
        uuid id PK
        string email
    }

    ADMIN_USERS {
        uuid user_id PK, FK
        string display_name
        timestamptz created_at
    }

    PROFILE {
        uuid id PK
        string full_name
        string professional_title
        text short_intro
        text long_bio
        string location
        string timezone
        boolean available_for_work
        string availability_text
        string email
        string resume_url
        string portrait_path
        timestamptz updated_at
    }

    SOCIAL_LINKS {
        uuid id PK
        uuid profile_id FK
        string platform
        string label
        string url
        int sort_order
        boolean is_visible
    }

    PROJECTS {
        uuid id PK
        uuid created_by FK
        string title
        string slug UK
        text summary
        string project_type
        string role
        string client
        string year
        string duration
        string status
        boolean is_featured
        int sort_order
        string cover_image_path
        string live_url
        string repository_url
        text overview
        text problem
        text approach
        text technical_decisions
        text outcome
        text reflection
        timestamptz published_at
        timestamptz created_at
        timestamptz updated_at
    }

    PROJECT_LINKS {
        uuid id PK
        uuid project_id FK
        string type
        string label
        string url
        int sort_order
    }

    PROJECT_MEDIA {
        uuid id PK
        uuid project_id FK
        string image_path
        string caption
        int sort_order
    }

    TECHNOLOGIES {
        uuid id PK
        string name UK
        string slug UK
    }

    PROJECT_TECHNOLOGIES {
        uuid project_id PK, FK
        uuid technology_id PK, FK
    }

    CONTACT_MESSAGES {
        uuid id PK
        string name
        string email
        string subject
        text message
        string status
        timestamptz created_at
        timestamptz read_at
    }
```

`AUTH_USERS` is Supabase's internal `auth.users` table, not a table we create.

## Status Enums

### Project status

```text
draft
published
archived
```

Only `published` projects are readable by visitors.

### Contact message status

```text
unread
read
archived
spam
```

## Row Level Security

RLS is enabled on all public tables.

### Public access

- Read `PROFILE`.
- Read `SOCIAL_LINKS` only where `is_visible = true`.
- Read `PROJECTS` only where `status = 'published'`.
- Read technologies, links, and media belonging to published projects.
- No read access to `CONTACT_MESSAGES`.
- No read access to the admin list.

### Admin access

- Only users present in `ADMIN_USERS`.
- Create and update all content.
- Read and update message status.
- Admin operations are still verified server-side, not just protected at the UI level.

## Notes

- `PROFILE` is effectively a singleton row in practice, but normalized for future
  multi-admin support.
- `is_featured` and `sort_order` control homepage display.
- A single admin is expected at launch; the schema supports more without change.
