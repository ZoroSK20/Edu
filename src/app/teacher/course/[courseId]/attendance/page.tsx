import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import AttendanceForm from './AttendanceForm';

export default async function RecordAttendancePage({ params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'TEACHER') redirect('/login');

  const course = await prisma.course.findUnique({
    where: { id: params.courseId, teacherId: session.user.id },
    include: {
      enrollments: {
        include: { student: true }
      }
    }
  });

  if (!course) return notFound();

  const students = course.enrollments.map(e => e.student);

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-gray-200 pb-6">
        <Link href={`/teacher/course/${params.courseId}`} className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to {course.code}
        </Link>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Record Attendance
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Mark students present or absent for a specific date.
        </p>
      </header>

      {students.length > 0 ? (
        <AttendanceForm courseId={course.id} students={students} />
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-gray-500">No students are currently enrolled in this course.</p>
        </div>
      )}
    </div>
  );
}
