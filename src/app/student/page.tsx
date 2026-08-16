import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function StudentDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'STUDENT') {
    redirect('/login');
  }

  const studentId = session.user.id;

  // Fetch all necessary data concurrently to save time
  const [enrollments, attendance, submissions] = await Promise.all([
    prisma.enrollment.findMany({
      where: { studentId },
      include: { course: { include: { teacher: true } } }
    }),
    prisma.attendance.findMany({
      where: { studentId }
    }),
    prisma.submission.findMany({
      where: { studentId },
      include: { assignment: { include: { course: true } } },
      orderBy: { submittedAt: 'desc' },
      take: 5
    })
  ]);

  // Calculate global attendance
  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'PRESENT').length;
  const globalAttendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 100;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-gray-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Welcome back, {session.user.name?.split(' ')[0]}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Here is your academic overview and recent performance.
          </p>
        </div>
        <Link href="/student/od">
          <Button variant="outline">Request OD</Button>
        </Link>
      </header>

      {/* Top Level KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Global Attendance</h3>
          <span className={`text-5xl font-bold ${globalAttendanceRate >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {totalClasses > 0 ? `${globalAttendanceRate}%` : 'N/A'}
          </span>
          <p className="text-xs text-gray-400 mt-2">
            {presentClasses} of {totalClasses} logged sessions attended
          </p>
        </Card>

        <Card className="p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Enrolled Courses</h3>
          <span className="text-5xl font-bold text-blue-600">
            {enrollments.length}
          </span>
          <p className="text-xs text-gray-400 mt-2">Active this semester</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrolled Courses */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-800 border-b border-gray-200 pb-2">Your Courses</h2>
          {enrollments.length > 0 ? (
            <div className="space-y-3">
              {enrollments.map((enrollment) => (
                <Card key={enrollment.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {enrollment.course.code}
                    </span>
                    <p className="text-sm font-medium text-gray-900 mt-1">{enrollment.course.title}</p>
                    <p className="text-xs text-gray-500">Prof. {enrollment.course.teacher.name}</p>
                  </div>
                  <Link href={`/student/insights`}>
                    <Button variant="outline" size="sm" className="text-xs">View Insights</Button>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
             <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
               <p className="text-sm text-gray-500">You are not enrolled in any courses.</p>
             </div>
          )}
        </div>

        {/* Recent Grades */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-800 border-b border-gray-200 pb-2">Recent Grades</h2>
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub.id} className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.assignment.title}</p>
                    <p className="text-xs text-gray-500">{sub.assignment.course.code}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{sub.marksAwarded ?? 'Pending'}</span>
                    {sub.marksAwarded !== null && <span className="text-xs text-gray-500">/100</span>}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
               <p className="text-sm text-gray-500">No recent grades available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
