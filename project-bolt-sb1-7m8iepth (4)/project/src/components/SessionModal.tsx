import React from 'react';
import { X, Clock, Users } from 'lucide-react';

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

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sessionTitle: string;
  imageUrl: string;
  description: string;
  coachingPoints: string[];
  duration: string;
  level: string;
  ageGroups: string[];
  sessionNumber: string;
  relatedSessions?: DrillData[];
}

export default function SessionModal({
  isOpen,
  onClose,
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
}: SessionModalProps) {
  if (!isOpen) return null;

  const allSessions = [
    { title, sessionTitle, imageUrl, description, coachingPoints, duration, level, ageGroups },
    ...relatedSessions
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-zinc-900 w-full h-full md:h-[90vh] md:w-[90vw] md:rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto pb-32">
          {allSessions.map((session, index) => (
            <div key={index} className="mb-8 last:mb-0">
              {/* Session Header with Image */}
              <div className="relative">
                <img 
                  src={session.imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800'}
                  alt={session.title}
                  className="w-full h-[50vh] object-contain bg-black"
                />
                {index === 0 && (
                  <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 to-transparent p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                      Session {session.title}
                    </span>
                    {index === 0 && relatedSessions && relatedSessions.length > 0 && (
                      <span className="text-sm text-zinc-400">
                        ({relatedSessions.length} related sessions)
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{session.sessionTitle}</h2>
                </div>
              </div>

              {/* Session Content */}
              <div className="p-6">
                {/* Meta Info */}
                <div className="flex items-center justify-between mb-6">
                  {/* First container: Now shows Users (People) icon with duration */}
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-primary" />
                    <span className="text-zinc-300">{session.duration}</span>
                  </div>

                  {/* Second container: Now shows Clock icon with age groups */}
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-primary" />
                    <span className="text-zinc-300">{session.ageGroups.join(', ')}</span>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary">
                    {session.level} Level
                  </span>
                </div>

                {/* Description */}
                <div className="bg-zinc-800 rounded-xl p-4 mb-6">
                  <p className="text-zinc-300 leading-relaxed">
                    {session.description}
                  </p>
                </div>

                {/* Coaching Points */}
                <div className="bg-zinc-800 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-primary mb-4">Coaching Points</h3>
                  <div className="space-y-3">
                    {session.coachingPoints.map((point, pointIndex) => (
                      <div key={pointIndex} className="flex items-start gap-2 text-zinc-300">
                        <span className="text-primary mt-1">•</span>
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Separator for all sessions except the last one */}
              {index < allSessions.length - 1 && (
                <div className="relative mt-8">
                  <div className="absolute inset-x-6 h-px bg-zinc-800" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}