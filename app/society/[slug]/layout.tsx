import { Suspense } from "react";
import { SocietyClientLayout } from "./SocietyClientLayout";

export function generateStaticParams() {
  return [{ slug: "green-park" }, { slug: "shanti-chs" }];
}

export default function SocietyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center p-8 text-sm text-slate-500">
          Loading society…
        </div>
      }
    >
      <SocietyClientLayout>{children}</SocietyClientLayout>
    </Suspense>
  );
}
