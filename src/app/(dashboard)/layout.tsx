'use client';

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return children;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayoutContent>{children}</DashboardLayoutContent>
  );
}
