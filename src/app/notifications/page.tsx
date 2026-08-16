import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import MarkReadButton from '@/components/MarkReadButton';

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return <div className="p-8 text-center">Not authenticated</div>;
  }
  const userEmail = session.user.email;

  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    include: {
      notifications: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!user) {
    return (
      <div className="p-8 text-center text-gray-500">
        User profile not found.
      </div>
    );
  }

  const notifications = user.notifications;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b border-gray-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Real-time updates regarding your classes, timetable shifts, OD approvals, and AI insights.
          </p>
        </div>
        <Button variant="outline" size="sm">
          Mark All as Read
        </Button>
      </header>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                !notification.read ? 'border-l-4 border-l-blue-600 bg-blue-50/20' : ''
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                    notification.type === 'SCHEDULE_UPDATE' ? 'bg-amber-100 text-amber-800' :
                    notification.type === 'OD_STATUS' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {notification.type.replace('_', ' ')}
                  </span>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  )}
                </div>
                <p className="text-sm text-gray-800 font-medium mt-1">
                  {notification.message}
                </p>
                <span className="text-[10px] text-gray-400 block pt-1">
                  {new Date(notification.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {!notification.read && (
                  <MarkReadButton notificationId={notification.id} />
                )}
              </div>
            </Card>
          ))
        ) : (
          <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 text-sm">You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
