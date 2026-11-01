"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell, GateMessage } from "@/components/demo/Shell";
import { useSession } from "@/lib/demo/hooks";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/societies", label: "Societies" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter();
  const ok = session?.role === "super_admin";

  useEffect(() => {
    if (!session) router.replace("/");
    else if (!ok) router.replace("/");
  }, [session, ok, router]);

  if (!session || !ok) {
    return (
      <GateMessage title="Super Admin only">
        Open the pitch home and enter as Super Admin.
      </GateMessage>
    );
  }

  return (
    <AppShell
      title="Platform Admin"
      subtitle="Create societies · invite chairman · no money ops"
      items={items}
    >
      {children}
    </AppShell>
  );
}
