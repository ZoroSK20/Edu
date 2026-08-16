import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');
  
  const defaultPasswordHash = await bcrypt.hash('password123', 10);

  // ---------------------------------------------------------
  // 1. Users (Teacher & Students)
  // ---------------------------------------------------------
  const teacher = await prisma.user.upsert({
    where: { email: 'prof.smith@portal.edu' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'prof.smith@portal.edu',
      name: 'Prof. Sarah Smith',
      passwordHash: defaultPasswordHash,
      role: 'TEACHER',
    },
  });

  const jane = await prisma.user.upsert({
    where: { email: 'jane.doe@portal.edu' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'jane.doe@portal.edu',
      name: 'Jane Doe',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
    },
  });

  const john = await prisma.user.upsert({
    where: { email: 'john.smith@portal.edu' },
    update: { passwordHash: defaultPasswordHash },
    create: {
      email: 'john.smith@portal.edu',
      name: 'John Smith',
      passwordHash: defaultPasswordHash,
      role: 'STUDENT',
    },
  });

  console.log('✅ Users seeded');

  // ---------------------------------------------------------
  // 2. Course & Enrollments
  // ---------------------------------------------------------
  const course = await prisma.course.upsert({
    where: { code: 'CS401' },
    update: {},
    create: {
      code: 'CS401',
      title: 'Advanced React Architecture',
      description: 'Deep dive into Server Components, Streaming, and State Management.',
      teacherId: teacher.id,
      enrollments: {
        create: [
          { studentId: jane.id },
          { studentId: john.id },
        ],
      },
    },
  });

  console.log('✅ Course and Enrollments seeded');

  // ---------------------------------------------------------
  // 3. Syllabus Tree (CourseTopics)
  // ---------------------------------------------------------
  // Check if topics exist to prevent duplication on re-runs
  const existingTopics = await prisma.courseTopic.count({ where: { courseId: course.id } });
  
  let topicReactFundamentals;
  let topicServerComponents;

  if (existingTopics === 0) {
    topicReactFundamentals = await prisma.courseTopic.create({
      data: {
        title: 'React Fundamentals Review',
        order: 1,
        courseId: course.id,
      },
    });

    topicServerComponents = await prisma.courseTopic.create({
      data: {
        title: 'React Server Components',
        order: 2,
        courseId: course.id,
        parentTopicId: topicReactFundamentals.id, // Nested topic
      },
    });

    await prisma.courseTopic.create({
      data: {
        title: 'Client vs Server State',
        order: 3,
        courseId: course.id,
        parentTopicId: topicReactFundamentals.id,
      },
    });

    console.log('✅ Syllabus tree seeded');
  } else {
    // Fetch them if they already exist for later relational mapping
    topicServerComponents = await prisma.courseTopic.findFirst({
      where: { title: 'React Server Components' }
    });
    console.log('⏭️  Syllabus tree already exists, skipping creation');
  }

  // ---------------------------------------------------------
  // 4. Assignments & Submissions
  // ---------------------------------------------------------
  const slotCount = await prisma.timetableSlot.count({ where: { courseId: course.id } });
  if (slotCount === 0) {
    await prisma.timetableSlot.create({
      data: {
        courseId: course.id,
        dayOfWeek: 1, // Monday
        startTime: '10:00',
        endTime: '11:30',
        room: 'Lecture Hall 4',
      }
    });
    console.log('✅ Timetable Slots seeded');
  }

  const assignmentCount = await prisma.assignment.count({ where: { courseId: course.id } });

  if (assignmentCount === 0) {
    const assignment = await prisma.assignment.create({
      data: {
        title: 'Build a Streaming SSR App',
        description: 'Implement a Next.js application utilizing React Suspense boundaries.',
        courseId: course.id,
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
        submissions: {
          create: [
            {
              studentId: jane.id,
              marksAwarded: 92,
              feedback: 'Excellent use of suspense boundaries.',
            },
            {
              studentId: john.id,
              // Un-graded submission
            },
          ],
        },
      },
    });
    console.log('✅ Assignments and Submissions seeded');
  }

  // ---------------------------------------------------------
  // 5. Exam, Papers, & AI Analysis (The OCR Pipeline data)
  // ---------------------------------------------------------
  // We need an Exam context to upload a Paper
  let exam = await prisma.exam.findFirst({ where: { courseId: course.id } });
  
  if (!exam) {
    exam = await prisma.exam.create({
      data: {
        title: 'Midterm Assessment',
        courseId: course.id,
        examDate: new Date(),
      }
    });

    // Create the Paper for Jane
    const paper = await prisma.paper.create({
      data: {
        examId: exam.id,
        uploadedById: jane.id, // Paper model uses uploadedById pointing to User, without a separate studentId
        courseId: course.id,
        fileUrl: '/uploads/mock-exam-jane.pdf',
        processingStatus: 'COMPLETED',
      },
    });

    // Create the extracted AI Analysis for that paper
    await prisma.paperAnalysis.create({
      data: {
        paperId: paper.id,
        questionNumber: 1,
        questionText: 'Explain React Server Components.',
        topicId: topicServerComponents ? topicServerComponents.id : undefined,
        correctness: 'partial',
        missingConcepts: 'Hydration',
        errors: 'Missed detailing how hydration works.',
        confidence: 0.85,
      }
    });
    
    console.log('✅ Exams, Papers, and AI Analysis seeded');
  }

  // ---------------------------------------------------------
  // 6. AI Insights (Topic Mapping & Aggregation)
  // ---------------------------------------------------------
  const insightsCount = await prisma.aIInsight.count({ where: { topicId: topicServerComponents?.id || '' } });

  if (insightsCount === 0 && topicServerComponents) {
    // Generate skill gaps for 6 students to trigger the "HIGH IMPACT" threshold in the Teacher dashboard
    const insightData = Array.from({ length: 6 }).map(() => ({
      studentId: jane.id, // Reusing Jane for simplicity, but simulating volume
      topicId: topicServerComponents.id,
      kind: 'SKILL_GAP',
      confidence: 0.92,
      content: 'Struggling with Server Component boundaries. Review the Next.js App Router boundary documentation.',
    }));

    await prisma.aIInsight.createMany({ data: insightData });
    console.log('✅ AI Insights (Skill Gaps) seeded');
  }

  // ---------------------------------------------------------
  // 7. OD Requests
  // ---------------------------------------------------------
  const odCount = await prisma.oDRequest.count({ where: { studentId: jane.id } });

  if (odCount === 0) {
    await prisma.oDRequest.create({
      data: {
        studentId: jane.id,
        eventName: 'National Tech Symposium 2026',
        reason: 'Presenting a paper on AI in Education',
        startDate: new Date('2026-08-20'),
        endDate: new Date('2026-08-22'),
        status: 'PENDING',
        aiConfidence: 0.96,
        aiStatus: 'RECOMMEND_APPROVE',
        documentUrl: '/uploads/od-mock-cert.pdf',
      },
    });
    console.log('✅ OD Requests seeded');
  }

  // ---------------------------------------------------------
  // 8. Notifications
  // ---------------------------------------------------------
  const notificationCount = await prisma.notification.count({ where: { userId: teacher.id } });

  if (notificationCount === 0) {
    await prisma.notification.createMany({
      data: [
        {
          userId: teacher.id,
          type: 'OD_STATUS',
          message: 'Jane Doe submitted an OD Request that requires your review.',
          read: false,
        },
        {
          userId: jane.id,
          type: 'SCHEDULE_UPDATE',
          message: 'Prof. Smith has shifted tomorrow’s lecture to 2:00 PM.',
          read: false,
        },
      ],
    });
    console.log('✅ Notifications seeded');
  }

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
