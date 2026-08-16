import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function RootPage() {
  const session = await getServerSession(authOptions);

  // If there's no session, push them to the login screen
  if (!session) {
    redirect('/login');
  }

  const role = (session.user as any)?.role;

  // Route the user to their dedicated workspace
  if (role === 'TEACHER') {
    redirect('/teacher');
  } else if (role === 'STUDENT') {
    redirect('/student');
  }

  // Fallback for an unknown role or admin role we haven't built yet
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 text-center">
      <div className="max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Access Restricted</h1>
        <p className="text-gray-600">
          Your account does not have an assigned role (Teacher/Student) required to view a dashboard. 
          Please contact the system administrator.
        </p>
      </div>
    </div>
  );
}
