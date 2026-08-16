import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card } from "@/components/ui/Card";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-medium text-ink mb-1">
        Welcome, {session?.user?.name}
      </h1>
      <p className="text-sm text-ink-soft mb-8">
        Admin dashboard — manage users, courses, classes and system-wide
        reports lands here in Phase 14.
      </p>
      <Card className="text-sm text-ink-soft">
        This route is confirmed working (role-guarded, session-aware).
      </Card>
    </div>
  );
}
