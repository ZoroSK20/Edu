import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui/Card";

async function getFeaturedCourses() {
  try {
    return await prisma.course.findMany({
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { teacher: true, _count: { select: { enrollments: true } } },
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <div>
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-xl">
          <h1 className="text-[40px] leading-[1.1] font-medium tracking-tight text-ink">
            Where teaching and learning stay in sync
          </h1>
          <p className="mt-4 text-[15px] text-ink-soft leading-relaxed">
            Attendance, grades and timetables in one place — with feedback
            that points students at exactly what to fix next, and gives
            teachers a real read on the whole class.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/courses" className="btn-accent">
              Explore courses
            </Link>
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-lg font-medium text-ink">Featured courses</h2>
          <Link
            href="/courses"
            className="text-sm text-ink-soft hover:text-ink transition-colors"
          >
            View all
          </Link>
        </div>

        {courses.length === 0 ? (
          <Card className="text-sm text-ink-soft">
            No courses published yet — check back soon.
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <Card className="h-full hover:border-ink/30 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <Badge tone="accent">{course.code}</Badge>
                    <span className="text-xs text-ink-soft">
                      {course._count.enrollments} enrolled
                    </span>
                  </div>
                  <h3 className="font-medium text-ink mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-ink-soft line-clamp-2">
                    {course.description ?? "No description yet."}
                  </p>
                  <p className="text-xs text-ink-faint mt-4">
                    {course.teacher.name}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-lg font-medium text-ink mb-8">
            One system, three portals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs text-ink-faint mb-2">Student</p>
              <p className="text-sm text-ink-soft leading-relaxed">
                Track grades and attendance, prep for upcoming topics ahead
                of class, and apply for OD without chasing anyone down in
                person.
              </p>
            </Card>
            <Card>
              <p className="text-xs text-ink-faint mb-2">Teacher</p>
              <p className="text-sm text-ink-soft leading-relaxed">
                Post syllabus and assignments, shift a class without losing
                the room, and review OD requests with an AI pre-check
                already attached.
              </p>
            </Card>
            <Card>
              <p className="text-xs text-ink-faint mb-2">Admin</p>
              <p className="text-sm text-ink-soft leading-relaxed">
                Manage courses, staff and enrollment, and see performance
                across the institution — not just one class at a time.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
