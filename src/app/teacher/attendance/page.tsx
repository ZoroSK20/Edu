import prisma from '@/lib/prisma';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default async function TeacherAttendancePage() {
  const teacherEmail = 'prof.smith@portal.edu';

  // Fetch the teacher's courses and the enrolled students for the roster
  const teacher = await prisma.user.findUnique({
    where: { email: teacherEmail },
    include: {
      coursesTaught: {
        include: {
          enrollments: {
            include: {
              student: {
                select: { id: true, name: true }
              }
            }
          }
        }
      }
    }
  });

  if (!teacher || teacher.coursesTaught.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No courses found for this teacher.
      </div>
    );
  }

  // Default to the first course for the UI shell
  const selectedCourse = teacher.coursesTaught[0];
  const currentDate = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <header className="border-b border-gray-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Attendance Logging
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Record daily attendance. Students with an approved OD will be flagged automatically.
          </p>
        </div>
        <div className="flex gap-3">
          <input 
            type="date" 
            defaultValue={currentDate}
            className="px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
          />
          <select className="px-3 py-2 border border-gray-300 rounded text-sm bg-white focus:ring-blue-500 focus:border-blue-500">
            {teacher.coursesTaught.map(course => (
              <option key={course.id} value={course.id}>{course.code}</option>
            ))}
          </select>
        </div>
      </header>

      {/* Attendance Roster */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-medium text-gray-800">
            Roster: {selectedCourse.title}
          </h2>
          <Button variant="outline" size="sm">Save Attendance</Button>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-6 py-4 font-medium">Student Name</th>
                  <th className="px-6 py-4 font-medium text-center">Present</th>
                  <th className="px-6 py-4 font-medium text-center">Absent</th>
                  <th className="px-6 py-4 font-medium text-center">On-Duty (OD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {selectedCourse.enrollments.length > 0 ? (
                  selectedCourse.enrollments.map((enrollment) => (
                    <tr key={enrollment.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input type="radio" name={`attendance-${enrollment.student.id}`} value="PRESENT" defaultChecked className="text-blue-600 focus:ring-blue-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input type="radio" name={`attendance-${enrollment.student.id}`} value="ABSENT" className="text-red-600 focus:ring-red-500" />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <input type="radio" name={`attendance-${enrollment.student.id}`} value="OD" className="text-amber-600 focus:ring-amber-500" disabled title="OD must be approved via the OD workflow" />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                      No students enrolled in this course yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </section>
    </div>
  );
}
