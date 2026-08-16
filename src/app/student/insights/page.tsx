import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function StudentInsightsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <div className="p-8 text-center">Not authenticated</div>;
  }
  const studentEmail = session.user.email;

  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
    include: {
      aiInsights: {
        where: { kind: 'SKILL_GAP' },
        include: {
          topic: { 
            include: { course: { select: { code: true, title: true } } } 
          }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!student) {
    return (
      <div className="p-8 text-center text-gray-500">
        Student data not found.
      </div>
    );
  }

  const insights = student.aiInsights;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Performance & Insights
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          AI-driven analysis of your recent assignments and exams, mapped directly to your course syllabus.
        </p>
      </header>

      {/* Insights Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-gray-800">Identified Focus Areas</h2>
        
        {insights.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight) => (
              <Card key={insight.id} className="p-6 flex flex-col justify-between border-t-4 border-t-amber-500 hover:shadow-md transition-shadow">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                        {insight.topic?.course?.code || 'COURSE'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Topic: {insight.topic?.title || 'General'}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                      {Math.round((insight.confidence ?? 0) * 100)}% Confidence
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    Insight Content
                  </h3>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-100">
                    {insight.content}
                  </p>
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                    Generated {new Date(insight.createdAt).toLocaleDateString()}
                  </span>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Related Notes
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center border-dashed">
            <h3 className="text-lg font-medium text-gray-900 mb-2">You're All Caught Up</h3>
            <p className="text-sm text-gray-500">
              No critical skill gaps have been identified in your recent coursework. Keep up the excellent work!
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
