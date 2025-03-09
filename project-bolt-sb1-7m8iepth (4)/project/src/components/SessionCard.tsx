import React, { useState } from 'react';
import { Clock, Users } from 'lucide-react';
import SessionModal from './SessionModal';

interface DrillData {
  title: string;
  sessionTitle: string;
  imageUrl: string;
  description: string;
  coachingPoints: string[];
  duration: string;
  level: string;
  ageGroups: string[];
}

interface SessionCardProps extends DrillData {
  sessionNumber: string;
  relatedSessions?: DrillData[];
}

export default function SessionCard({
  title,
  sessionTitle,
  imageUrl,
  description,
  coachingPoints,
  duration,
  level,
  ageGroups,
  sessionNumber,
  relatedSessions = [],
}: SessionCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-zinc-900 rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Session Image */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-full cursor-pointer transition-opacity hover:opacity-90"
        >
          <img 
            src={imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800'}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </button>

        {/* Session Title */}
        <div className="p-4 bg-zinc-800">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-zinc-100">Session {sessionNumber}</h3>
            {relatedSessions && relatedSessions.length > 0 && (
              <span className="text-sm text-zinc-400">
                ({relatedSessions.length} related sessions)
              </span>
            )}
          </div>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {/* Description */}
          <div className="bg-zinc-800 rounded-xl p-4 mb-6">
            <p className="text-zinc-300 text-sm leading-relaxed min-h-[4rem]">
              {description}
            </p>
          </div>

          {/* Coaching Points */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-primary">Coaching Points</h4>
            {coachingPoints[0] && (
              <div className="flex items-start gap-2 text-sm text-zinc-300 min-h-[3rem]">
                <span className="text-primary mt-1">•</span>
                {coachingPoints[0]}
              </div>
            )}
          </div>

          {/* Meta Info */}
<div className="mt-auto space-y-4 mb-6">
  <div className="flex items-center justify-between">
    {/* Users icon now paired with duration */}
    <div className="flex items-center gap-2">
      <Users size={16} className="text-primary" />
      <span className="text-sm text-zinc-300">{duration}</span>
    </div>
    
    {/* Clock icon now paired with age groups */}
    <div className="flex items-center gap-2">
      <Clock size={16} className="text-primary" />
      <span className="text-sm text-zinc-300">{ageGroups.join(', ')}</span>
    </div>
  </div>

  <span className="inline-block text-sm px-3 py-1 rounded-full bg-primary/20 text-primary">
    {level} Level
  </span>
</div>

          {/* Action Button */}
          <button 
            className="btn-primary w-full"
            onClick={() => setIsModalOpen(true)}
          >
            Start Session
          </button>
        </div>
      </div>

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        sessionTitle={sessionTitle}
        imageUrl={imageUrl}
        description={description}
        coachingPoints={coachingPoints}
        duration={duration}
        level={level}
        ageGroups={ageGroups}
        sessionNumber={sessionNumber}
        relatedSessions={relatedSessions}
      />
    </>
  );
}