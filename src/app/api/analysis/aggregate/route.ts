import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: 'courseId query parameter is required.' },
        { status: 400 }
      );
    }

    // 1. Group the individual student insights by topic to find common failure points
    const aggregated = await prisma.aIInsight.groupBy({
      by: ['topicId'],
      where: {
        topic: { courseId: courseId },
        kind: 'SKILL_GAP',
        // In a real scenario, we'd also filter by a specific timeframe or examId here
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // 2. Prisma's groupBy doesn't allow including relations, so we fetch the topic details separately
    const topicIds = aggregated.map((a) => a.topicId).filter(Boolean) as string[];
    
    if (topicIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    const topics = await prisma.courseTopic.findMany({
      where: { id: { in: topicIds } },
      select: { id: true, title: true },
    });

    // 3. Map the aggregated counts back to the topic metadata to format the payload for the frontend
    const classTrends = aggregated.map((agg) => {
      const topic = topics.find((t) => t.id === agg.topicId);
      const studentCount = agg._count.id;
      
      return {
        topicId: agg.topicId,
        topicTitle: topic?.title || 'Unknown Topic',
        studentCount,
        // Establish a dynamic threshold for what constitutes a "High Impact" trend
        impactLevel: studentCount >= 5 ? 'HIGH' : studentCount >= 3 ? 'MEDIUM' : 'LOW',
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Class-wide insights aggregated successfully.',
      data: classTrends,
    });
  } catch (error) {
    console.error('Aggregation API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error during insight aggregation.' },
      { status: 500 }
    );
  }
}
