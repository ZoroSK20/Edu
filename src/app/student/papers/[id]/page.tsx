import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function StudentPaperReviewPage({ params }: { params: { id: string } }) {
  const paperId = params.id;

  // Fetch the paper, the exam context, and the AI analysis records
  let paper = await prisma.paper.findUnique({
    where: { id: paperId },
    include: {
      exam: {
        include: { course: true }
      },
      analyses: {
        orderBy: { questionNumber: 'asc' }
      } 
    }
  });

  // Fallback for development testing
  if (!paper) {
    paper = await prisma.paper.findFirst({
      where: { analyses: { some: {} } },
      include: {
        exam: { include: { course: true } },
        analyses: {
          orderBy: { questionNumber: 'asc' }
        }
      }
    });
  }

  if (!paper) return notFound();

  const aiInsights = paper.analyses || [];
  
  // Calculate an average confidence/score for the header
  const avgScore = aiInsights.length > 0 
    ? aiInsights.reduce((acc, curr) => acc + (curr.confidence || 0), 0) / aiInsights.length 
    : null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-6">
        <Link href="/student" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <div className="flex justify-between items-end gap-4 mt-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-blue-600 font-semibold tracking-wider bg-blue-50 px-2 py-1 rounded">
                {paper.exam?.course?.code || 'COURSE'}
              </span>
              <span className="text-sm text-gray-500">{paper.exam?.course?.title}</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              {paper.exam?.title || 'Exam Review'}
            </h1>
          </div>
          
          {avgScore !== null && (
            <div className="bg-gray-50 px-6 py-3 rounded-md border border-gray-200 text-center">
              <span className="block text-xs text-gray-500 uppercase tracking-wider mb-1">AI Score</span>
              <span className="text-2xl font-medium text-gray-900">
                {Math.round(avgScore * 100)}%
              </span>
            </div>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Question Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-medium text-gray-800">Per-Question Feedback</h2>
          
          {aiInsights.length > 0 ? (
            <div className="space-y-4">
              {aiInsights.map((insight) => (
                <Card key={insight.id} className="p-6 border-l-4 border-l-indigo-500">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium text-gray-900">Q{insight.questionNumber}</h3>
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      (insight.confidence || 0) >= 0.7 ? 'bg-green-100 text-green-800' : 
                      (insight.confidence || 0) >= 0.4 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      Score: {Math.round((insight.confidence || 0) * 100)}%
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mb-2">{insight.questionText}</p>
                  <p className="text-sm text-gray-700 mb-4">{insight.errors}</p>
                  
                  {insight.missingConcepts && (
                    <div className="bg-gray-50 p-3 rounded border border-gray-100">
                      <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider block mb-2">
                        Concepts to Review
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {insight.missingConcepts.split(',').map((concept: string, idx: number) => (
                          <span key={idx} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md shadow-sm">
                            {concept.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center text-gray-500 text-sm">
              Detailed breakdown is not available for this paper yet.
            </Card>
          )}
        </div>

        {/* Sidebar: Extracted Text / Original Paper */}
        <div className="space-y-6">
          <Card className="p-6 bg-gray-50/50">
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Document Details
            </h3>
            <div className="space-y-4">
              <Button variant="outline" className="w-full text-sm shadow-sm">
                View Original Scan
              </Button>
              
              <div>
                <span className="text-xs font-semibold text-gray-600 uppercase block mb-2 mt-4">
                  OCR Extraction Status
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                  Completed
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
