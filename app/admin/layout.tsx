"use client";

import { SideNav, TopBar } from "@/components/demo/Shell";

const items = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/societies", label: "Societies" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <TopBar
        title="Platform Admin"
        subtitle="Create societies · invite chairman · no money ops"
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <SideNav items={items} />
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}
