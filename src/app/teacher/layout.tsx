import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any)?.role !== 'TEACHER') {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white p-6 hidden md:block shrink-0">
        <h2 className="text-xl font-semibold text-slate-900 mb-8">Teacher Portal</h2>
        <nav className="space-y-4">
          <Link href="/teacher" className="block text-slate-600 hover:text-slate-900 transition-colors font-medium">Dashboard</Link>
          <Link href="/teacher/timetable" className="block text-slate-600 hover:text-slate-900 transition-colors font-medium">Timetable Manager</Link>
          <Link href="/teacher/od" className="block text-slate-600 hover:text-slate-900 transition-colors font-medium">OD Requests</Link>
          <Link href="/teacher/papers/upload" className="block text-slate-600 hover:text-slate-900 transition-colors font-medium">Upload Exam Papers</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
