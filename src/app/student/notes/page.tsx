import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function StudentNotesPage() {
  const studentEmail = 'jane.doe@portal.edu'; 

  const student = await prisma.user.findUnique({
    where: { email: studentEmail },
  });

  if (!student) {
    return (
      <div className="p-8 text-center text-gray-500">
        Student data not found.
      </div>
    );
  }

  // Fetch the student's notes, including the related topic and course context
  const notes = await prisma.note.findMany({
    where: { studentId: student.id },
    include: {
      topic: {
        include: {
          course: {
            select: { code: true, title: true }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Topic Preparation & Notes
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Your personal notes linked to upcoming course topics. If a teacher shifts a class, your prep stays aligned.
          </p>
        </div>
        <Button>+ New Note</Button>
      </header>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.length > 0 ? (
          notes.map((note) => (
            <Card key={note.id} className="p-6 flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-mono text-indigo-600 font-semibold tracking-wider bg-indigo-50 px-2 py-1 rounded">
                    {note.topic.course.code}
                  </span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2 truncate">
                  {note.topic.title}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-4">
                  {note.content}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                  Updated {new Date(note.updatedAt).toLocaleDateString()}
                </span>
                <Button variant="outline" size="sm" className="text-xs">
                  Edit Prep
                </Button>
              </div>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-gray-500 text-sm">You haven't created any preparation notes yet.</p>
            <Button variant="outline" className="mt-4">Start Preparing</Button>
          </div>
        )}
      </div>
    </div>
  );
}
