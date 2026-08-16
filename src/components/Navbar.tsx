import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import SignOutButton from './SignOutButton';

export default async function Navbar() {
  const session = await getServerSession(authOptions);
  
  // Do not render the navbar on the login screen
  if (!session) return null; 

  const role = (session.user as any)?.role;

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600 tracking-tight">
                EduPortal
              </Link>
            </div>
            <div className="hidden sm:-my-px sm:ml-8 sm:flex sm:space-x-6 items-center">
              {role === 'STUDENT' && (
                <>
                  <Link href="/student" className="text-gray-600 hover:text-gray-900 px-1 pt-1 text-sm font-medium">Dashboard</Link>
                  <Link href="/student/insights" className="text-gray-600 hover:text-gray-900 px-1 pt-1 text-sm font-medium">Insights</Link>
                  <Link href="/student/od" className="text-gray-600 hover:text-gray-900 px-1 pt-1 text-sm font-medium">Request OD</Link>
                </>
              )}
              {role === 'TEACHER' && (
                <>
                  <Link href="/teacher" className="text-gray-600 hover:text-gray-900 px-1 pt-1 text-sm font-medium">Dashboard</Link>
                  <Link href="/teacher/insights" className="text-gray-600 hover:text-gray-900 px-1 pt-1 text-sm font-medium">Class Insights</Link>
                  <Link href="/teacher/papers/upload" className="text-gray-600 hover:text-gray-900 px-1 pt-1 text-sm font-medium">Upload Papers</Link>
                  <Link href="/teacher/od" className="text-gray-600 hover:text-gray-900 px-1 pt-1 text-sm font-medium">OD Approvals</Link>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <Link href="/notifications" className="text-gray-600 hover:text-gray-900 text-sm font-medium relative">
              Alerts
              {/* Optional: Add a small red dot if unread notifications exist */}
            </Link>
            
            <div className="flex items-center gap-4 border-l border-gray-200 pl-6">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-gray-900 leading-none mb-1">{session.user?.name}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider">{role}</span>
              </div>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
