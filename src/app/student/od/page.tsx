'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function StudentODPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      const res = await fetch('/api/od/submit', {
        method: 'POST',
        body: formData, // fetch automatically sets the correct multipart/form-data boundary
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setMessage({ text: 'OD Request submitted successfully. The AI pre-check is complete and it is now pending review.', type: 'success' });
        form.reset();
      } else {
        setMessage({ text: data.error || 'Failed to submit OD request.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An unexpected error occurred while submitting.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="border-b border-gray-200 pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
          Request On-Duty (OD)
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Submit your absence details and supporting documentation for AI verification and teacher approval.
        </p>
      </header>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className={`p-4 rounded-md text-sm border ${message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name
              </label>
              <input 
                type="text" 
                id="event" 
                name="event" 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" 
                placeholder="e.g., National Tech Symposium 2026" 
              />
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Absence
              </label>
              <textarea 
                id="reason" 
                name="reason" 
                rows={3} 
                required 
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" 
                placeholder="Provide a brief explanation of your participation..."
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input 
                  type="date" 
                  id="startDate" 
                  name="startDate" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" 
                />
              </div>
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input 
                  type="date" 
                  id="endDate" 
                  name="endDate" 
                  required 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" 
                />
              </div>
            </div>

            <div className="pt-2">
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-1">
                Supporting Document
              </label>
              <input 
                type="file" 
                id="document" 
                name="document" 
                required 
                accept=".pdf,.png,.jpg,.jpeg" 
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 border border-gray-200 rounded-md" 
              />
              <p className="text-xs text-gray-500 mt-2">
                Upload official invitations, tickets, or certificates (PDF, JPG, PNG).
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="min-w-[150px]">
              {isSubmitting ? 'Processing...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
