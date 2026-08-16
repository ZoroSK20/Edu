import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function TeacherStudentProfilePage({ params }: { params: { studentId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'TEACHER') redirect('/login');

  const { studentId } = params;

  // 1. Fetch Student Profile
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: { id: true, name: true, email: true }
  });

  if (!student) return notFound();

  // 2. Fetch Aggregated Data (using parallel queries for performance)
  const [attendance, insights, submissions] = await Promise.all([
    prisma.attendance.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    }),
    prisma.aIInsight.findMany({
      where: { studentId, kind: 'SKILL_GAP' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { topic: true }
    }),
    prisma.submission.findMany({
      where: { studentId },
      include: { assignment: { include: { course: true } } },
      orderBy: { submittedAt: 'desc' },
      take: 5
    })
  ]);

  // 3. Calculate Attendance Stats
  const totalClasses = attendance.length;
  const presentClasses = attendance.filter(a => a.status === 'PRESENT').length;
  const attendanceRate = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/teacher" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {student.name}
          </h1>
          <p className="text-sm font-mono text-gray-500 mt-1">
            {student.email}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Message Student</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Metric 1: Attendance */}
        <Card className="p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Overall Attendance</h3>
          <span className={`text-5xl font-bold ${attendanceRate >= 75 ? 'text-green-600' : 'text-red-600'}`}>
            {totalClasses > 0 ? `${attendanceRate}%` : 'N/A'}
          </span>
          <p className="text-xs text-gray-400 mt-2">
            {presentClasses} / {totalClasses} classes attended
          </p>
        </Card>

        {/* Metric 2: Average Grade (Derived from Submissions) */}
        <Card className="p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Recent Assignment Avg</h3>
          <span className="text-5xl font-bold text-blue-600">
             {submissions.length > 0 
               ? `${Math.round(submissions.reduce((acc, sub) => acc + (sub.marksAwarded || 0), 0) / submissions.length)}%` 
               : 'N/A'}
          </span>
          <p className="text-xs text-gray-400 mt-2">Based on {submissions.length} recent grades</p>
        </Card>

        {/* Metric 3: Active Interventions */}
        <Card className="p-6 flex flex-col justify-center items-center text-center">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">AI Skill Gaps</h3>
          <span className={`text-5xl font-bold ${insights.length > 0 ? 'text-amber-500' : 'text-gray-400'}`}>
            {insights.length}
          </span>
          <p className="text-xs text-gray-400 mt-2">Active topic interventions</p>
        </Card>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Recent Submissions */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-800 border-b border-gray-200 pb-2">Recent Grades</h2>
          {submissions.length > 0 ? (
            <div className="space-y-3">
              {submissions.map((sub) => (
                <Card key={sub.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sub.assignment.title}</p>
                    <p className="text-xs text-gray-500">{sub.assignment.course.code}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-gray-900">{sub.marksAwarded || 0}</span>
                    <span className="text-xs text-gray-500">/100</span>
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

        {/* Right Column: AI Insights */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-800 border-b border-gray-200 pb-2">Identified Skill Gaps</h2>
          {insights.length > 0 ? (
            <div className="space-y-3">
              {insights.map((insight) => (
                <Card key={insight.id} className="p-4 border-l-4 border-l-amber-500">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded uppercase tracking-wider">
                      {insight.topic?.title || 'General Concept'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {Math.round((insight.confidence ?? 0) * 100)}% Confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{insight.content}</p>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-gray-200 rounded-lg">
               <p className="text-sm text-gray-500">No skill gaps identified. Student is tracking well.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
