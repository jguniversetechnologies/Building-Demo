"use client";

import { useParams } from "next/navigation";

/** Client-safe slug from the URL — avoids blocking prerender with use(params). */
export function useSocietySlug() {
  const params = useParams<{ slug: string }>();
  return params.slug ?? "";
}
