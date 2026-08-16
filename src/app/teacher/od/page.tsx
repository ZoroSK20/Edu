import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ODActionButtons from '@/components/ODActionButtons';

export default async function TeacherODReviewPage() {
  // Fetch pending OD requests. 
  // In production, this would be filtered by students enrolled in the teacher's specific courses.
  const pendingRequests = await prisma.oDRequest.findMany({
    where: { status: 'PENDING' },
    include: {
      student: {
        select: { name: true, email: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          On-Duty (OD) Approvals
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Review pending OD requests. AI pre-checks verify document consistency, but final approval remains yours.
        </p>
      </header>

      <div className="space-y-6">
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <Card key={request.id} className="p-6 flex flex-col lg:flex-row gap-6 hover:shadow-md transition-shadow">
              {/* Request Details */}
              <div className="flex-grow space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-medium text-gray-900">{request.student.name}</h2>
                    <p className="text-sm text-gray-500">{request.eventName}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-sm font-medium text-gray-700">
                      {new Date(request.startDate).toLocaleDateString()} &mdash; {new Date(request.endDate).toLocaleDateString()}
                    </span>
                    <a href={request.documentUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                      View Document &nearr;
                    </a>
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-1">Reason</h3>
                  <p className="text-sm text-gray-600">{request.reason}</p>
                </div>
              </div>

              {/* AI Insight & Actions */}
              <div className="w-full lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                <div className="bg-gray-50 p-4 rounded-md border border-gray-200 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700 uppercase">AI Pre-Check</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      request.aiStatus === 'RECOMMEND_APPROVE' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {Math.round((request.aiConfidence ?? 0) * 100)}% Match
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {request.aiStatus === 'RECOMMEND_APPROVE' 
                      ? "Dates and event name match the uploaded document. No conflicts detected." 
                      : "Manual verification recommended. Potential inconsistency in attached file."}
                  </p>
                </div>

                <ODActionButtons requestId={request.id} />
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500">No pending OD requests to review.</p>
          </div>
        )}
      </div>
    </div>
  );
}
