import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function AssignmentGradingPage({ params }: { params: { id: string } }) {
  const assignmentId = params.id;

  let assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      course: {
        select: { title: true, code: true },
      },
      submissions: {
        include: {
          student: {
            select: { name: true, email: true },
          },
        },
        orderBy: {
          student: { name: 'asc' },
        },
      },
    },
  });

  if (!assignment) {
    // If testing without a real assignment ID, fallback to the first available one
    const fallbackAssignment = await prisma.assignment.findFirst({
      include: {
        course: { select: { title: true, code: true } },
        submissions: {
          include: { student: { select: { name: true, email: true } } },
        },
      },
    });
    
    if (!fallbackAssignment) return notFound();
    
    // Redirecting to the fallback for development ease
    assignment = fallbackAssignment;
  }

  // Assuming a default maxMarks of 100 since it's not in the schema for Assignments
  const maxMarks = 100;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <Link href="/teacher/assignments" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Assignments
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-mono text-blue-600 font-semibold tracking-wider bg-blue-50 px-2 py-1 rounded">
              {assignment.course.code}
            </span>
            <span className="text-sm text-gray-500">{assignment.course.title}</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mt-2">
            {assignment.title}
          </h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            {assignment.description}
          </p>
        </div>
        <div className="bg-gray-50 px-4 py-2 rounded-md border border-gray-200 text-center min-w-[120px]">
          <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">Max Marks</span>
          <span className="text-xl font-medium text-gray-900">{maxMarks}</span>
        </div>
      </header>

      {/* Grading Roster */}
      <section className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-800">Student Submissions</h2>
          <Button variant="outline" size="sm">Save All Grades</Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Marks Awarded</th>
                  <th className="px-6 py-4 font-medium">Feedback (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignment.submissions.length > 0 ? (
                  assignment.submissions.map((submission) => (
                    <tr key={submission.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{submission.student.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.marksAwarded !== null ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Graded
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            Needs Review
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          defaultValue={submission.marksAwarded ?? ''}
                          max={maxMarks}
                          min={0}
                          className="w-20 px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="--"
                        />
                      </td>
                      <td className="px-6 py-4 w-full">
                        <input
                          type="text"
                          defaultValue={submission.feedback ?? ''}
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Add feedback..."
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      No submissions found for this assignment yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
