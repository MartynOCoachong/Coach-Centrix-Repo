import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight, Timer, Zap, Play } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useGoogleSheets } from '../lib/googleSheets';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import SessionModal from '../components/SessionModal';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const { data: sheetData } = useGoogleSheets();
  const { data: techSheetData } = useGoogleSheets('R Tec - Session');
  const [sampleSession, setSampleSession] = useState<any>(null);
  const [techSession, setTechSession] = useState<any>(null);

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone')
            .eq('id', user.id)
            .single();
          
          if (data) {
            setProfile(data);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }

    getProfile();
  }, []);

  useEffect(() => {
    if (sheetData?.values) {
      const sessions = sheetData.values.slice(1);
      if (sessions.length > 0) {
        // Find the main session (session 1)
        const mainSession = sessions.find(row => row[0] === '1');
        if (mainSession) {
          // Find related sessions (1A, 1B, etc.)
          const relatedSessions = sessions
            .filter(row => /^1[A-Z]$/.test(row[0]))
            .map(row => ({
              title: row[0] || '',
              sessionTitle: row[1] || '',
              description: row[2] || '',
              duration: row[4] || '60 mins',
              level: row[5] || 'Beginner',
              ageGroups: [(row[3] || '').trim()],
              imageUrl: row[7] || '',
              coachingPoints: (row[6] || '').split('\n').filter(Boolean),
            }));

          const session = {
            title: mainSession[0] || '',
            sessionTitle: mainSession[1] || '',
            description: mainSession[2] || '',
            duration: mainSession[4] || '60 mins',
            level: mainSession[5] || 'Beginner',
            ageGroups: [(mainSession[3] || '').trim()],
            imageUrl: mainSession[7] || '',
            coachingPoints: (mainSession[6] || '').split('\n').filter(Boolean),
            relatedSessions: relatedSessions
          };
          setSampleSession(session);
        }
      }
    }
  }, [sheetData]);

  useEffect(() => {
    if (techSheetData?.values) {
      const sessions = techSheetData.values.slice(1);
      if (sessions.length > 0) {
        // Find the main session (session 1)
        const mainSession = sessions.find(row => row[0] === '1');
        if (mainSession) {
          // Find related sessions (1A, 1B, etc.)
          const relatedSessions = sessions
            .filter(row => /^1[A-Z]$/.test(row[0]))
            .map(row => ({
              title: row[0] || '',
              sessionTitle: row[1] || '',
              description: row[2] || '',
              duration: row[4] || '60 mins',
              level: row[5] || 'Beginner',
              ageGroups: [(row[3] || '').trim()],
              imageUrl: row[7] || '',
              coachingPoints: (row[6] || '').split('\n').filter(Boolean),
            }));

          const session = {
            title: mainSession[0] || '',
            sessionTitle: mainSession[1] || '',
            description: mainSession[2] || '',
            duration: mainSession[4] || '60 mins',
            level: mainSession[5] || 'Beginner',
            ageGroups: [(mainSession[3] || '').trim()],
            imageUrl: mainSession[7] || '',
            coachingPoints: (mainSession[6] || '').split('\n').filter(Boolean),
            relatedSessions: relatedSessions
          };
          setTechSession(session);
        }
      }
    }
  }, [techSheetData]);

  const handleSlide = () => {
    setCurrentIndex(currentIndex === 0 ? 1 : 0);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="relative">
        {/* Hero Section */}
        <div className="h-[500px] relative">
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&q=80&w=3870"
              alt="Football Stadium"
              className="w-full h-full object-cover"
            />
            {/* Triple gradient overlay for stronger effect */}
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
          </div>

          {/* Header */}
          <div className="relative z-10">
            <Header profile={profile} />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 pt-17 px-6">
            <h1 className="mb-4 flex flex-col items-start max-w-6xl mx-auto">
              <span className="text-8xl font-black text-outline tracking-tight leading-none">COACH</span>
              <span className="text-8xl font-black text-white tracking-tight leading-none -mt-2">CENTRIX</span>
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-6 -mt-20 relative z-10 pb-32">
          {/* Featured Programs */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Featured Programs</h2>
              <button 
                onClick={handleSlide}
                className="text-zinc-400 flex items-center hover:text-primary transition-colors"
              >
                {currentIndex === 0 ? 'See All' : 'Show Less'} <ChevronRight size={20} />
              </button>
            </div>
            
            <div className="relative overflow-hidden">
              <div 
                ref={sliderRef}
                className="flex transition-transform duration-500 ease-in-out gap-4"
                style={{
                  transform: `translateX(-${currentIndex * 50}%)`,
                }}
              >
                <div className="card min-w-[calc(50%-8px)]">
                  <div className="relative">
                    <img 
                      src="https://i.ibb.co/gFS2q4Mx/football-4544858-1280.jpg"
                      className="w-full h-40 object-cover rounded-xl mb-3"
                      alt="Tech Lead Sessions"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-primary">Tech Lead Sessions</h3>
                    <div className="flex items-center text-zinc-400 text-sm">
                      <Timer size={16} className="mr-1" />
                      <span>16 weeks</span>
                    </div>
                  </div>
                </div>

                <div className="card min-w-[calc(50%-8px)]">
                  <div className="relative">
                    <img 
                      src="https://i.ibb.co/GfGtjfRK/soccer-7392844-1280.jpg"
                      className="w-full h-40 object-cover rounded-xl mb-3"
                      alt="U4/U5 Season"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-primary">U4/U5 Season</h3>
                    <div className="flex items-center text-zinc-400 text-sm">
                      <Zap size={16} className="mr-1" />
                      <span>6 weeks</span>
                    </div>
                  </div>
                </div>

                <div className="card min-w-[calc(50%-8px)]">
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=2956"
                      className="w-full h-40 object-cover rounded-xl mb-3"
                      alt="Evaluation Camp"
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-primary">Evaluation Camp</h3>
                    <div className="flex items-center text-zinc-400 text-sm">
                      <Timer size={16} className="mr-1" />
                      <span>4 days</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Session Sample */}
          {sampleSession && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Session Sample</h2>
              <div className="bg-zinc-900 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Content Column */}
                  <div className="p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                          Session {sampleSession.title}
                        </span>
                        {sampleSession.relatedSessions && sampleSession.relatedSessions.length > 0 && (
                          <span className="text-sm text-zinc-400">
                            ({sampleSession.relatedSessions.length} related sessions)
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {sampleSession.sessionTitle}
                      </h3>
                      <div className="bg-zinc-800 rounded-xl p-4 mb-6">
                        <p className="text-zinc-300">
                          {sampleSession.description}
                        </p>
                      </div>
                      {sampleSession.coachingPoints.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-primary mb-2">Key Points</h4>
                          <div className="bg-zinc-800 rounded-xl p-4">
                            <div className="flex items-start gap-2 text-zinc-300">
                              <span className="text-primary mt-1">•</span>
                              {sampleSession.coachingPoints[0]}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsModalOpen(true)}
                      className="btn-primary mt-8 flex items-center justify-center gap-2"
                    >
                      <Play size={20} />
                      Start Sample Session
                    </button>
                  </div>

                  {/* Image Column */}
                  <div className="relative h-full min-h-[400px] md:min-h-full">
                    <img 
                      src={sampleSession.imageUrl || "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&q=80&w=2960"}
                      alt={sampleSession.sessionTitle}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Added black overlay */}
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:bg-gradient-to-l" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sample Tech Session */}
          {techSession && (
            <div>
              <h2 className="text-lg font-semibold mb-4">Sample Tech Session</h2>
              <div className="bg-zinc-900 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2">
                  {/* Content Column */}
                  <div className="p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm">
                          Session {techSession.title}
                        </span>
                        {techSession.relatedSessions && techSession.relatedSessions.length > 0 && (
                          <span className="text-sm text-zinc-400">
                            ({techSession.relatedSessions.length} related sessions)
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-4">
                        {techSession.sessionTitle}
                      </h3>
                      <div className="bg-zinc-800 rounded-xl p-4 mb-6">
                        <p className="text-zinc-300">
                          {techSession.description}
                        </p>
                      </div>
                      {techSession.coachingPoints.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold text-primary mb-2">Key Points</h4>
                          <div className="bg-zinc-800 rounded-xl p-4">
                            <div className="flex items-start gap-2 text-zinc-300">
                              <span className="text-primary mt-1">•</span>
                              {techSession.coachingPoints[0]}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button 
                      onClick={() => setIsTechModalOpen(true)}
                      className="btn-primary mt-8 flex items-center justify-center gap-2"
                    >
                      <Play size={20} />
                      Start Tech Session
                    </button>
                  </div>

                  {/* Image Column */}
                  <div className="relative h-full min-h-[400px] md:min-h-full">
                    <img 
                      src={techSession.imageUrl || "https://images.unsplash.com/photo-1517927033932-b3d18e61fb3a?auto=format&fit=crop&q=80&w=2960"}
                      alt={techSession.sessionTitle}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Added black overlay */}
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent md:bg-gradient-to-l" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Modals */}
      {sampleSession && (
        <SessionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={sampleSession.title}
          sessionTitle={sampleSession.sessionTitle}
          imageUrl={sampleSession.imageUrl}
          description={sampleSession.description}
          coachingPoints={sampleSession.coachingPoints}
          duration={sampleSession.duration}
          level={sampleSession.level}
          ageGroups={sampleSession.ageGroups}
          sessionNumber={sampleSession.title}
          relatedSessions={sampleSession.relatedSessions}
        />
      )}

      {techSession && (
        <SessionModal
          isOpen={isTechModalOpen}
          onClose={() => setIsTechModalOpen(false)}
          title={techSession.title}
          sessionTitle={techSession.sessionTitle}
          imageUrl={techSession.imageUrl}
          description={techSession.description}
          coachingPoints={techSession.coachingPoints}
          duration={techSession.duration}
          level={techSession.level}
          ageGroups={techSession.ageGroups}
          sessionNumber={techSession.title}
          relatedSessions={techSession.relatedSessions}
        />
      )}

      {/* Bottom Navigation */}
      <div className="relative z-50">
        <BottomNav />
      </div>
    </div>
  );
}