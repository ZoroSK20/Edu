import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 hidden md:block shrink-0">
        <h2 className="text-xl font-semibold text-slate-900 mb-8">Admin Center</h2>
        <nav className="space-y-4">
          <Link href="/admin" className="block text-slate-600 hover:text-slate-900 transition-colors font-medium">Dashboard</Link>
          <Link href="/admin/users" className="block text-slate-600 hover:text-slate-900 transition-colors font-medium">Users Management</Link>
          <Link href="/admin/jobs" className="block text-slate-600 hover:text-slate-900 transition-colors font-medium">Background Jobs</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8 max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
