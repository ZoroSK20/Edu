'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type SlotProps = {
  id: string;
  courseCode: string;
  courseTitle: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

export default function RescheduleCard({ slot }: { slot: SlotProps }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [newStartTime, setNewStartTime] = useState(slot.startTime);

  const handleSave = async () => {
    setIsSubmitting(true);
    const res = await fetch('/api/timetable/shift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slotId: slot.id,
        effectiveDate,
        newStartTime,
      })
    });

    if (res.ok) {
      setIsEditing(false);
      router.refresh();
      alert('Shift created successfully and students notified.');
    } else {
      alert('Failed to shift class.');
    }
    setIsSubmitting(false);
  };

  return (
    <Card className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
            {slot.courseCode}
          </span>
          <h3 className="font-medium text-gray-900">{slot.courseTitle}</h3>
        </div>
        {!isEditing && (
          <div className="text-sm text-gray-600">
            {DAYS[slot.dayOfWeek]}s • {slot.startTime} - {slot.endTime}
          </div>
        )}
      </div>

      {!isEditing && (
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Shift Class
        </Button>
      )}

      {isEditing && (
        <div className="w-full md:w-auto bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date of Shift</label>
              <input 
                type="date" 
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">New Start Time</label>
              <input 
                type="time" 
                value={newStartTime}
                onChange={(e) => setNewStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Confirm & Notify'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
