import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import RescheduleCard from './RescheduleCard';

export default async function TeacherTimetablePage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user?.role !== 'TEACHER') redirect('/login');

  // Fetch all recurring timetable slots for this teacher's courses
  const slots = await prisma.timetableSlot.findMany({
    where: {
      course: {
        teacherId: session.user.id
      }
    },
    include: { course: true },
    orderBy: [
      { dayOfWeek: 'asc' },
      { startTime: 'asc' }
    ]
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Timetable Manager
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Manage your recurring classes. Shifting a specific class date will automatically notify all enrolled students.
        </p>
      </header>

      {slots.length > 0 ? (
        <div className="space-y-4">
          {slots.map((slot) => (
            <RescheduleCard 
              key={slot.id} 
              slot={{
                id: slot.id,
                courseCode: slot.course.code,
                courseTitle: slot.course.title,
                dayOfWeek: slot.dayOfWeek,
                startTime: slot.startTime,
                endTime: slot.endTime
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900">No Scheduled Classes</h3>
          <p className="text-gray-500">You don't have any weekly recurring slots mapped.</p>
        </div>
      )}
    </div>
  );
}
