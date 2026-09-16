import type { Profile } from "@/lib/queries/types";

export const DEFAULT_PROFILE: Profile = {
  id: "00000000-0000-0000-0000-000000000000",
  full_name: "Adi Alfian Hafis",
  professional_title: "Full-Stack Developer",
  short_intro:
    "Building web applications, enterprise systems, and digital tools with a focus on clean architecture and reliable engineering.",
  long_bio:
    "Full-stack software developer with experience in developing web applications, enterprise systems, and backend services.",
  location: null,
  timezone: "Asia/Jakarta",
  available_for_work: true,
  availability_text: "Available for work",
  email: "aloalfyan@gmail.com",
  resume_url: null,
  portrait_path: null,
  updated_at: new Date().toISOString(),
};
