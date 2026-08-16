import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TeacherCourseManagementPage({ params }: { params: { id: string } }) {
  // In a production environment, we would also verify that the logged-in teacher owns this course.
  const courseId = params.id;

  let course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      topics: {
        where: { parentTopicId: null },
        include: {
          children: { include: { children: true } },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  // Fallback for our seeded data if accessed directly via testing link
  if (!course) {
    course = await prisma.course.findFirst({
      include: {
        topics: {
          where: { parentTopicId: null },
          include: {
            children: { include: { children: true } },
          },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex justify-between items-start border-b border-gray-200 pb-6">
        <div>
          <Link href="/teacher" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
            &larr; Back to Dashboard
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            {course.code}: {course.title}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your syllabus, topics, and upcoming assignments.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">Edit Details</Button>
          <Button>+ Add Topic</Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Syllabus Management */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-medium text-gray-800">Syllabus Structure</h2>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Read-only preview</span>
            </div>
            
            <Card className="p-6">
              {course.topics.length > 0 ? (
                <ul className="space-y-4">
                  {course.topics.map((topic) => (
                    <li key={topic.id} className="border border-gray-200 rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium text-gray-900">{topic.title}</h3>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs">Edit</Button>
                      </div>
                      
                      {topic.children && topic.children.length > 0 && (
                        <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                          {topic.children.map(child => (
                            <div key={child.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                              <span className="text-sm text-gray-700">{child.title}</span>
                              <Button variant="outline" size="sm" className="text-[10px] px-2 py-1">Edit</Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No topics added yet. Start building your syllabus.
                </div>
              )}
            </Card>
          </section>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Course Pulse
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Total Students</span>
                <span className="font-medium">24</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Attendance</span>
                <span className="font-medium text-green-600">92%</span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-600">AI Interventions</span>
                <span className="font-medium text-amber-600">3 Pending</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
