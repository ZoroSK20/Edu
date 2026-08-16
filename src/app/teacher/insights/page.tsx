import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function TeacherInsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <div className="p-8 text-center">Not authenticated</div>;
  }
  const teacherEmail = session.user.email;

  // 1. Fetch the teacher and their assigned courses
  const teacher = await prisma.user.findUnique({
    where: { email: teacherEmail },
    include: {
      coursesTaught: true,
    }
  });

  if (!teacher || teacher.coursesTaught.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No courses assigned. Cannot generate insights.
      </div>
    );
  }

  // Defaulting to the first course for the UI dashboard
  const activeCourse = teacher.coursesTaught[0];

  // 2. We need to aggregate AIInsights by topic. Since AIInsight does not have courseId,
  // we first fetch the valid topicIds for the active course.
  const courseTopics = await prisma.courseTopic.findMany({
    where: { courseId: activeCourse.id },
    select: { id: true, title: true }
  });

  const topicIds = courseTopics.map((t) => t.id);

  // 3. Perform the aggregation logic directly in the Server Component filtering by those topicIds
  const aggregated = await prisma.aIInsight.groupBy({
    by: ['topicId'],
    where: {
      topicId: { in: topicIds },
      kind: 'SKILL_GAP',
    },
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' },
    },
  });

  // 4. Map counts to topics and calculate impact
  const classTrends = aggregated.map((agg) => {
    const topic = courseTopics.find((t) => t.id === agg.topicId);
    const studentCount = agg._count.id;
    return {
      topicId: agg.topicId,
      topicTitle: topic?.title || 'Unknown Topic',
      studentCount,
      impactLevel: studentCount >= 5 ? 'HIGH' : studentCount >= 3 ? 'MEDIUM' : 'LOW',
    };
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Class-Wide Insights
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Aggregated skill gaps based on AI analysis of recent exams and assignments.
          </p>
        </div>
        <div className="bg-gray-50 px-4 py-2 rounded-md border border-gray-200 flex items-center gap-3">
          <span className="text-sm text-gray-600 font-medium">Viewing Course:</span>
          <span className="text-sm font-mono text-blue-700 font-semibold uppercase">
            {activeCourse.code}
          </span>
        </div>
      </header>

      {/* Aggregation Dashboard */}
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-medium text-gray-800">Critical Intervention Areas</h2>
          <Button variant="outline" size="sm">Generate Lesson Plan Adjustments</Button>
        </div>

        {classTrends.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classTrends.map((trend, index) => (
              <Card key={index} className={`p-6 border-t-4 transition-shadow hover:shadow-md ${
                trend.impactLevel === 'HIGH' ? 'border-t-red-500' :
                trend.impactLevel === 'MEDIUM' ? 'border-t-amber-500' : 'border-t-blue-500'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm ${
                    trend.impactLevel === 'HIGH' ? 'bg-red-50 text-red-700' :
                    trend.impactLevel === 'MEDIUM' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {trend.impactLevel} IMPACT
                  </span>
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {trend.topicTitle}
                </h3>
                
                <div className="mt-4 flex items-end gap-2">
                  <span className="text-3xl font-semibold text-gray-900">{trend.studentCount}</span>
                  <span className="text-sm text-gray-500 pb-1">students struggling</span>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Button variant="outline" className="w-full text-xs">
                    View Student List
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Significant Trends Detected</h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              There are currently no major skill gaps affecting a large portion of the class. The cohort is tracking well against the syllabus.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
