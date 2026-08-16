import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function TeacherCoursePage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user?.role !== 'TEACHER') {
    redirect('/login');
  }

  const { courseId } = params;

  // 1. Fetch the course and ensure it belongs to the logged-in teacher
  const course = await prisma.course.findUnique({
    where: { 
      id: courseId,
      teacherId: session.user.id 
    },
    include: {
      enrollments: {
        include: {
          student: true
        }
      },
      topics: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!course) {
    return notFound();
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/teacher" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
            &larr; Back to Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-1">
            <span className="text-sm font-mono text-blue-700 bg-blue-50 px-2 py-1 rounded font-semibold tracking-wider">
              {course.code}
            </span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {course.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            {course.description}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Edit Syllabus</Button>
          <Link href={`/teacher/course/${course.id}/attendance`}>
            <Button>Record Attendance</Button>
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Student Roster */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium text-gray-800">Enrolled Students ({course.enrollments.length})</h2>
          </div>

          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider text-xs border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Student Name</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {course.enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900">
                        {enrollment.student.name}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">
                        {enrollment.student.email}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          href={`/teacher/student/${enrollment.student.id}`} 
                          className="text-blue-600 hover:text-blue-800 font-medium text-xs"
                        >
                          View Profile &nearr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {course.enrollments.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No students currently enrolled.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar: Syllabus Overview */}
        <div className="space-y-6">
          <Card className="p-6 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Syllabus Topics
            </h3>
            {course.topics.length > 0 ? (
              <ul className="space-y-3">
                {course.topics.map((topic) => (
                  <li key={topic.id} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5">&bull;</span>
                    {topic.title}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic">No topics mapped yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
