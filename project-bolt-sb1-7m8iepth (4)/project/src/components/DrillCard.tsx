import React, { useState } from 'react';
import { Clock, Users } from 'lucide-react';
import DrillModal from './DrillModal';

interface DrillCardProps {
  title: string;
  imageUrl: string;
  description: string;
  duration: string;
  ageGroups: string[];
  drillType: string;
  coachingPoints: string[];
}

export default function DrillCard({
  title,
  imageUrl,
  description,
  duration,
  ageGroups,
  drillType,
  coachingPoints,
}: DrillCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="bg-zinc-900 rounded-2xl overflow-hidden h-full flex flex-col">
        {/* Drill Image */}
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

        {/* Drill Type Badge */}
        <div className="p-4 bg-zinc-800">
          <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
            {drillType}
          </span>
        </div>

        <div className="p-6 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-semibold text-zinc-100 mb-4">{title}</h3>

          {/* Description */}
          <div className="bg-zinc-800 rounded-xl p-4 mb-6">
            <p className="text-zinc-300 text-sm leading-relaxed min-h-[4rem]">
              {description}
            </p>
          </div>

          {/* Meta Info */}
          <div className="mt-auto space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary" />
                <span className="text-sm text-zinc-300">{duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-primary" />
                <span className="text-sm text-zinc-300">{ageGroups.join(', ')}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            className="btn-primary w-full"
            onClick={() => setIsModalOpen(true)}
          >
            View Drill
          </button>
        </div>
      </div>

      <DrillModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={title}
        imageUrl={imageUrl}
        description={description}
        coachingPoints={coachingPoints}
        duration={duration}
        drillType={drillType}
        ageGroups={ageGroups}
      />
    </>
  );
}