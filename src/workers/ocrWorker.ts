import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Simulated OCR delay to mimic API latency (e.g., Claude Vision API)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function processOCRJobs() {
  console.log('🔄 Starting OCR Worker Loop...');

  while (true) {
    try {
      // 1. Fetch the oldest queued OCR job
      const job = await prisma.job.findFirst({
        where: { 
          type: 'OCR_EXTRACTION',
          status: 'QUEUED' 
        },
        orderBy: { createdAt: 'asc' },
      });

      if (!job) {
        // No jobs in queue, wait a few seconds before polling again
        await delay(5000);
        continue;
      }

      // 1.5 Parse the payload which is stored as a JSON string
      const payload = JSON.parse(job.payload) as { paperId: string; fileUrl: string };

      console.log(`\n📦 Picked up Job [${job.id}] for Paper [${payload.paperId}]`);

      // 2. Mark Job as Processing
      await prisma.job.update({
        where: { id: job.id },
        data: { status: 'PROCESSING' },
      });

      // 3. Simulate OCR Extraction Process
      console.log(`🔍 Extracting text from: ${payload.fileUrl}...`);
      await delay(3000); // Simulate network/processing time

      const simulatedExtractedText = `
        Q1: Explain React Server Components.
        Student Answer: Server components render on the server, reducing the javascript bundle sent to the client.
        
        Q2: Describe State Management.
        Student Answer: State is how data changes over time. I am not sure about the client vs server boundary.
      `.trim();

      // 4. Update the Paper record and complete the Job in a transaction
      await prisma.$transaction(async (tx) => {
        // Update the paper to reflect successful OCR extraction
        await tx.paper.update({
          where: { id: payload.paperId },
          data: {
            processingStatus: 'COMPLETED', 
          }
        });

        // We no longer create the full PaperAnalysis here in the OCR worker.
        // The OCR worker just updates the paper to COMPLETED. 
        // The AI extraction pipeline (/api/analysis/run) creates the PaperAnalysis rows.

        // Mark the job as complete
        await tx.job.update({
          where: { id: job.id },
          data: { status: 'COMPLETE' },
        });
      });

      console.log(`✅ Job [${job.id}] completed successfully.`);

    } catch (error) {
      console.error('❌ Error processing job:', error);
      // In a production app, we would mark the job as FAILED and implement a retry mechanism.
      await delay(5000); 
    }
  }
}

// Start the worker loop
processOCRJobs()
  .catch(e => console.error('Fatal Worker Error:', e))
  .finally(async () => await prisma.$disconnect());
