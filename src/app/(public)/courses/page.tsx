import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function CoursesPage() {
  // Fetch all available courses, including the teacher's name
  const courses = await prisma.course.findMany({
    include: {
      teacher: {
        select: { name: true },
      },
    },
    orderBy: {
      title: 'asc',
    },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900">
            Course Catalog
          </h1>
          <p className="text-lg text-gray-600 mt-2 max-w-2xl">
            Browse our AI-enhanced curriculum. Select a course to view the detailed syllabus and prerequisites.
          </p>
        </div>
        {/* Placeholder for future search/filter inputs */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
            disabled
          />
        </div>
      </header>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Card key={course.id} className="flex flex-col justify-between p-6 hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-blue-600 font-semibold tracking-wider uppercase bg-blue-50 px-2 py-1 rounded">
                    {course.code}
                  </span>
                </div>
                <h2 className="text-xl font-medium text-gray-900 mb-2 line-clamp-1">
                  {course.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                  {course.description}
                </p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Instructor: {course.teacher?.name || 'TBA'}
                </span>
                <Link href={`/courses/${course.id}`}>
                  <Button variant="outline">
                    View Syllabus
                  </Button>
                </Link>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            <p>No courses are currently available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
