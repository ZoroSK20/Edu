import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default async function AdminDashboard() {
  const [userCount, courseCount, jobCount, activeJobs] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.job.count(),
    prisma.job.count({ where: { status: 'QUEUED' } })
  ]);

  return (
    <div>
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">System Overview</h1>
          <p className="text-slate-500">High-level metrics and system health.</p>
        </div>
        <a href="/api/admin/report" download>
          <Button variant="default">Download System Report</Button>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Users</h3>
          <p className="text-3xl font-semibold text-slate-900">{userCount}</p>
        </Card>
        <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Active Courses</h3>
          <p className="text-3xl font-semibold text-slate-900">{courseCount}</p>
        </Card>
        <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-medium text-slate-500 mb-1">Total Jobs</h3>
          <p className="text-3xl font-semibold text-slate-900">{jobCount}</p>
        </Card>
        <Card className="p-6 bg-blue-50 border-blue-200 shadow-sm rounded-xl">
          <h3 className="text-sm font-medium text-blue-800 mb-1">Jobs Queued</h3>
          <p className="text-3xl font-semibold text-blue-900">{activeJobs}</p>
        </Card>
      </div>
    </div>
  );
}
