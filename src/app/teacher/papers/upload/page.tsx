'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function PaperUploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // In a fully integrated environment, we would fetch these from the database via a Server Component wrapper
  // or a dedicated API route. We mock them here for the UI shell foundation.
  const mockExams = [
    { id: 'exam-101', title: 'Midterm: Web Architecture' },
    { id: 'exam-102', title: 'Final: Database Design' }
  ];

  const mockStudents = [
    { id: 'jane-doe-id', name: 'Jane Doe' },
    { id: 'john-smith-id', name: 'John Smith' }
  ];

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsUploading(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/papers/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ 
          text: 'Paper uploaded successfully. Background OCR extraction is now queued.', 
          type: 'success' 
        });
        form.reset();
      } else {
        setMessage({ 
          text: data.error || 'Failed to upload paper.', 
          type: 'error' 
        });
      }
    } catch (err) {
      setMessage({ 
        text: 'An unexpected error occurred during upload.', 
        type: 'error' 
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Upload Exam Paper
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Upload a scanned exam paper. The AI Engine will automatically extract the handwriting and queue it for analysis.
        </p>
      </header>

      <Card className="p-8">
        <form onSubmit={handleUpload} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-md text-sm border ${
              message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Exam
                </label>
                <select 
                  id="examId" 
                  name="examId" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">-- Choose Exam --</option>
                  {mockExams.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                  Select Student
                </label>
                <select 
                  id="studentId" 
                  name="studentId" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="">-- Choose Student --</option>
                  {mockStudents.map(student => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <label htmlFor="paper" className="block text-sm font-medium text-gray-700 mb-1">
                Scanned Paper (PDF, Image)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="paper" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input id="paper" name="paper" type="file" required className="sr-only" accept=".pdf,.png,.jpg,.jpeg" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, PDF up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <Button type="submit" disabled={isUploading} className="min-w-[150px]">
              {isUploading ? 'Uploading...' : 'Upload Paper'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
