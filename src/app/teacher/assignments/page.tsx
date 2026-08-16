import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default async function TeacherAssignmentsPage() {
  const teacherEmail = 'prof.smith@portal.edu';

  // Fetch the teacher's courses and their associated assignments
  const teacher = await prisma.user.findUnique({
    where: { email: teacherEmail },
    include: {
      coursesTaught: {
        include: {
          assignments: {
            orderBy: { createdAt: 'desc' },
            include: {
              submissions: true, // Pull submissions to show grading progress
            }
          }
        }
      }
    }
  });

  if (!teacher) {
    return (
      <div className="p-8 text-center text-gray-500">
        Teacher data not found.
      </div>
    );
  }

  const courses = teacher.coursesTaught;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Assignments & Grading
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Manage course assignments, track student submissions, and enter marks manually.
          </p>
        </div>
        <Button>+ Create Assignment</Button>
      </header>

      {/* Assignments by Course */}
      <div className="space-y-10">
        {courses.length > 0 ? (
          courses.map((course) => (
            <section key={course.id} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                <span className="text-xs font-mono text-blue-600 font-semibold tracking-wider bg-blue-50 px-2 py-1 rounded">
                  {course.code}
                </span>
                <h2 className="text-xl font-medium text-gray-800">
                  {course.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {course.assignments && course.assignments.length > 0 ? (
                  course.assignments.map((assignment) => (
                    <Card key={assignment.id} className="p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {assignment.title}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {assignment.description}
                        </p>
                        
                        {/* Grading Progress Metric */}
                        <div className="bg-gray-50 p-3 rounded-md mb-4 border border-gray-100">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-500">Submissions Graded</span>
                            <span className="font-medium text-gray-900">
                              {assignment.submissions.filter(s => s.marksAwarded !== null).length} / {assignment.submissions.length}
                            </span>
                          </div>
                          {/* Simple Progress Bar */}
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-blue-600 h-1.5 rounded-full" 
                              style={{ 
                                width: assignment.submissions.length > 0 
                                  ? `${(assignment.submissions.filter(s => s.marksAwarded !== null).length / assignment.submissions.length) * 100}%` 
                                  : '0%' 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-2 pt-4 border-t border-gray-100">
                        <Button variant="outline" className="w-full text-sm">
                          Enter Marks
                        </Button>
                      </div>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full py-6 text-center text-gray-500 text-sm border border-dashed border-gray-200 rounded-md">
                    No assignments posted for this course yet.
                  </div>
                )}
              </div>
            </section>
          ))
        ) : (
          <div className="py-12 text-center text-gray-500">
            You are not currently assigned to any courses.
          </div>
        )}
      </div>
    </div>
  );
}
