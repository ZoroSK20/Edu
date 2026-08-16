import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";

export default async function AdminJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  return (
    <div>
      <h1 className="text-3xl font-semibold text-slate-900 mb-2">Background Jobs</h1>
      <p className="text-slate-500 mb-8">Monitor AI processing and background queue tasks.</p>

      <Card className="overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Job ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{job.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{job.type}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      job.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                      job.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{new Date(job.createdAt).toLocaleString()}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={job.result || job.error || ''}>
                    {job.error ? (
                      <span className="text-red-600">{job.error}</span>
                    ) : (
                      job.result || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {jobs.length === 0 && (
            <div className="p-8 text-center text-slate-500">No jobs in queue.</div>
          )}
        </div>
      </Card>
    </div>
  );
}
