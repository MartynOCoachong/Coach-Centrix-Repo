import React from 'react';
import { X, Clock, Users } from 'lucide-react';

interface DrillModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  imageUrl: string;
  description: string;
  coachingPoints: string[];
  duration: string;
  drillType: string;
  ageGroups: string[];
}

export default function DrillModal({
  isOpen,
  onClose,
  title,
  imageUrl,
  description,
  coachingPoints,
  duration,
  drillType,
  ageGroups,
}: DrillModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-zinc-900 w-full h-full md:h-[90vh] md:w-[90vw] md:rounded-2xl overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto">
          {/* Drill Header with Image */}
          <div className="relative">
            <img 
              src={imageUrl || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800'}
              alt={title}
              className="w-full h-[50vh] object-contain bg-black"
            />
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900 to-transparent p-6">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/20 text-primary text-sm mb-2">
                {drillType}
              </span>
              <h2 className="text-2xl font-bold text-white">{title}</h2>
            </div>
          </div>

          {/* Drill Content */}
          <div className="p-6">
            {/* Meta Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-primary" />
                <span className="text-zinc-300">{duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} className="text-primary" />
                <span className="text-zinc-300">{ageGroups.join(', ')}</span>
              </div>
            </div>

            {/* Description */}
            <div className="bg-zinc-800 rounded-xl p-4 mb-6">
              <p className="text-zinc-300 leading-relaxed">
                {description}
              </p>
            </div>

            {/* Coaching Points */}
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-primary mb-4">Coaching Points</h3>
              <div className="space-y-3">
                {coachingPoints.map((point, index) => (
                  <div key={index} className="flex items-start gap-2 text-zinc-300">
                    <span className="text-primary mt-1">•</span>
                    {point}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}