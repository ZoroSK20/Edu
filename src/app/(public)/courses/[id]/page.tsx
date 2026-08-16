import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { notFound } from 'next/navigation';

// Helper component to recursively render the nested topic tree
const TopicTree = ({ topics, level = 0 }: { topics: any[]; level?: number }) => {
  if (!topics || topics.length === 0) return null;

  return (
    <ul className="space-y-3">
      {topics.map((topic) => (
        <li key={topic.id} style={{ marginLeft: `${level * 1.5}rem` }}>
          <div className="flex items-start gap-3">
            <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-gray-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">{topic.title}</h4>
            </div>
          </div>
          {/* Recursively render child topics */}
          {topic.children && topic.children.length > 0 && (
            <div className="mt-3 border-l border-gray-200 ml-1 pl-3">
              <TopicTree topics={topic.children} level={level + 1} />
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default async function CourseDetailsPage({ params }: { params: { id: string } }) {
  // In a real scenario, this ID comes from the URL. 
  // For validation with our seed data, we will fetch the first available course if the ID is a placeholder.
  let courseId = params.id;
  
  let course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      teacher: true,
      topics: {
        where: { parentTopicId: null }, // Only fetch top-level topics to start the tree
        include: {
          children: {
            include: { children: true }, // Go 3 levels deep (adjust based on schema needs)
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  });

  // Fallback for our seeded data testing if hitting this directly from a generic link
  if (!course) {
    course = await prisma.course.findFirst({
      include: {
        teacher: true,
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
    <div className="p-8 max-w-5xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Course Header */}
      <header className="border-b border-gray-200 pb-8">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-sm font-mono text-blue-600 font-semibold tracking-wider uppercase bg-blue-50 px-2 py-1 rounded">
              {course.code}
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-gray-900 mt-4">
              {course.title}
            </h1>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl">
              {course.description}
            </p>
          </div>
          <div className="flex flex-col gap-3 min-w-[200px]">
            <Button className="w-full shadow-sm">
              Enroll Now
            </Button>
            <p className="text-xs text-center text-gray-500">
              Instructor: {course.teacher?.name || 'TBA'}
            </p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Main Syllabus Content */}
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="text-2xl font-medium text-gray-900 mb-6">Course Syllabus</h2>
            <Card className="p-8">
              {course.topics.length > 0 ? (
                <TopicTree topics={course.topics} />
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  The syllabus for this course has not been published yet.
                </p>
              )}
            </Card>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="p-6 bg-gray-50/50 border-dashed">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Course Details
            </h3>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex justify-between">
                <span>Format</span>
                <span className="font-medium text-gray-900">In-Person</span>
              </li>
              <li className="flex justify-between">
                <span>Prerequisites</span>
                <span className="font-medium text-gray-900">None</span>
              </li>
              <li className="flex justify-between">
                <span>AI Insights</span>
                <span className="font-medium text-green-600">Enabled</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
