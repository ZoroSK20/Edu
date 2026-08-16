import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function TeacherDashboard() {
  // Fetch the seeded teacher user (Dr. Alan Smith)
  const teacherEmail = 'prof.smith@portal.edu'; 

  const teacher = await prisma.user.findUnique({
    where: { email: teacherEmail },
    include: {
      coursesTaught: true,
    },
  });

  // Fetch pending OD Requests to display actionable items
  const pendingODs = await prisma.oDRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      student: {
        select: { name: true }
      }
    },
    take: 5,
  });

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Teacher data not found. Please run the seed script.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Welcome, {teacher.name}
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Your class overviews, pending approvals, and AI teaching insights.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content: Courses & Class Insights */}
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Assigned Courses</h2>
            <div className="grid grid-cols-1 gap-4">
              {teacher.coursesTaught.map((course) => (
                <Card key={course.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                        {course.code}
                      </span>
                      <h3 className="text-lg font-medium text-gray-900 mt-1">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-2">
                        {course.description}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Manage Course
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Class Insights & Interventions</h2>
            <Card className="p-12 text-center text-gray-500 text-sm border-dashed">
              AI class-level common-error aggregation will populate here once paper analyses are complete.
            </Card>
          </section>
        </div>

        {/* Sidebar: Actionable Items (OD Requests) */}
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-medium text-gray-800 mb-4">Pending Approvals</h2>
            <div className="space-y-4">
              {pendingODs.length > 0 ? (
                pendingODs.map((request) => (
                  <Card key={request.id} className="p-5 border-l-4 border-l-blue-500">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-semibold text-gray-900">
                        {request.student.name}
                      </h4>
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        AI: {request.aiConfidence != null ? Math.round(request.aiConfidence * 100) : 0}% Match
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {request.eventName}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <Button size="sm" className="w-full text-xs">Review</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-5 text-center text-gray-500 text-sm">
                  No pending OD requests.
                </Card>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
