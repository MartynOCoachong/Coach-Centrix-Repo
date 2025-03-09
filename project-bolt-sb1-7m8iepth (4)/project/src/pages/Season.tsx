import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useGoogleSheets } from '../lib/googleSheets';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import SessionModal from '../components/SessionModal';
import { Calendar, Clock, ChevronRight, ChevronLeft, Trophy, Target, Flag } from 'lucide-react';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface SessionData {
  dates: string[];
  title: string;
  sessionTitle: string;
  description: string;
  duration: string;
  level: string;
  ageGroups: string[];
  imageUrl?: string;
  coachingPoints: string[];
  relatedSessions?: SessionData[];
}

const ageGroups = ['U4/U5', 'U7', 'U9', 'U11', 'U13', 'U15+'];

export default function Season() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('U4/U5');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2025, 2, 7)); // March 7, 2025
  const [sessionData, setSessionData] = useState<Record<string, SessionData>>({});
  const [recentSessions, setRecentSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sheetName = selectedAgeGroup === 'U4/U5' ? 'U4/U5 Outdoor' : 'Sessions';
  const { data: sheetData, loading: sheetsLoading, error: sheetsError } = useGoogleSheets(sheetName);

  const getCurrentWeekDates = (startDate: Date = new Date(2025, 2, 2)) => {
    const today = new Date(2025, 2, 7); // Set today as March 7, 2025
    
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      return {
        date: day,
        isToday: day.toDateString() === today.toDateString(),
        hasSession: false
      };
    });
  };

  const [weekStartDate, setWeekStartDate] = useState(new Date(2025, 2, 2));
  const weekDays = getCurrentWeekDates(weekStartDate);

  const getCurrentMonth = () => {
    return weekStartDate.toLocaleString('default', { month: 'long' });
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(weekStartDate);
    nextWeek.setDate(weekStartDate.getDate() + 7);
    setWeekStartDate(nextWeek);
  };

  const handlePreviousWeek = () => {
    const previousWeek = new Date(weekStartDate);
    previousWeek.setDate(weekStartDate.getDate() - 7);
    setWeekStartDate(previousWeek);
  };

  const handleStartSession = (session: SessionData) => {
    const mainSessionNumber = session.title.replace(/[A-Z]/g, '');
    
    if (sheetData?.values) {
      const allSessions = sheetData.values.slice(1).map(row => ({
        title: row[0] || '',
        sessionTitle: row[1] || '',
        description: row[2] || '',
        duration: row[4] || '60 mins',
        level: row[5] || 'Beginner',
        ageGroups: [selectedAgeGroup],
        imageUrl: row[7] || '',
        coachingPoints: (row[6] || '').split('\n').filter(Boolean),
        dates: (row[11] || '').split(',').map((date: string) => date.trim()),
      }));

      const mainSession = allSessions.find(s => s.title === mainSessionNumber);
      const variations = allSessions.filter(s => 
        s.title.startsWith(mainSessionNumber) && 
        s.title !== mainSessionNumber &&
        /^[0-9]+[A-Z]$/.test(s.title)
      );

      if (mainSession) {
        setSelectedSession({
          ...mainSession,
          relatedSessions: variations
        });
      } else {
        setSelectedSession(session);
      }
    } else {
      setSelectedSession(session);
    }
    
    setIsModalOpen(true);
  };

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('first_name, last_name, email, phone')
            .eq('id', user.id)
            .single();
          
          if (profileData) {
            setProfile(profileData);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    getProfile();
  }, []);

  useEffect(() => {
    if (sheetData?.values) {
      const sessions: Record<string, SessionData> = {};
      const allSessions: SessionData[] = [];
      
      const processedSessions = sheetData.values.slice(1).map(row => ({
        title: row[0] || '',
        sessionTitle: row[1] || '',
        description: row[2] || '',
        duration: row[4] || '60 mins',
        level: row[5] || 'Beginner',
        ageGroups: [selectedAgeGroup],
        imageUrl: row[7] || '',
        coachingPoints: (row[6] || '').split('\n').filter(Boolean),
        dates: (row[11] || '').split(',').map(date => date.trim()),
      }));

      const groupedSessions = processedSessions.reduce((acc, session) => {
        const mainNumber = session.title.replace(/[A-Z]/g, '');
        if (!acc[mainNumber]) {
          acc[mainNumber] = {
            main: null,
            variations: []
          };
        }
        
        if (session.title === mainNumber) {
          acc[mainNumber].main = session;
        } else if (/^[0-9]+[A-Z]$/.test(session.title)) {
          acc[mainNumber].variations.push(session);
        }
        
        return acc;
      }, {} as Record<string, { main: SessionData | null; variations: SessionData[] }>);

      Object.values(groupedSessions).forEach(({ main, variations }) => {
        if (main) {
          const sessionWithRelated = {
            ...main,
            relatedSessions: variations
          };

          main.dates.forEach(date => {
            sessions[date] = sessionWithRelated;
          });

          allSessions.push(sessionWithRelated);
        }
      });

      setSessionData(sessions);
      
      const sortedSessions = allSessions
        .sort((a, b) => {
          const latestDateA = new Date(Math.max(...a.dates.map(d => new Date(d).getTime())));
          const latestDateB = new Date(Math.max(...b.dates.map(d => new Date(d).getTime())));
          return latestDateB.getTime() - latestDateA.getTime();
        })
        .slice(0, 3);
      setRecentSessions(sortedSessions);
    }
  }, [sheetData, selectedAgeGroup]);

  useEffect(() => {
    setSelectedDate(new Date(2025, 2, 7));
  }, [selectedAgeGroup]);

  if (loading || sheetsLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-primary">Loading...</div>
      </div>
    );
  }

  if (sheetsError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-red-500">Error loading calendar data. Please try again later.</div>
      </div>
    );
  }

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedDaySession = sessionData[selectedDateStr];

  // Mock upcoming games data
  const upcomingGames = [
    {
      opponent: "Thunder FC",
      date: "2025-03-15",
      time: "10:00 AM",
      location: "Central Park Field 1",
      type: "League Match"
    },
    {
      opponent: "Lightning United",
      date: "2025-03-22",
      time: "11:30 AM",
      location: "Riverside Stadium",
      type: "Cup Game"
    },
    {
      opponent: "Storm City",
      date: "2025-03-29",
      time: "09:00 AM",
      location: "Community Sports Complex",
      type: "League Match"
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header profile={profile} />

      <div className="px-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Your Season</h1>
          <p className="text-zinc-400">Track your progress and upcoming sessions</p>
        </div>

        <div className="max-w-6xl mx-auto mb-6">
          <div className="grid grid-cols-6 gap-4">
            {ageGroups.map((age) => (
              <button 
                key={age}
                onClick={() => setSelectedAgeGroup(age)}
                className={`bg-zinc-800 rounded-xl p-3 text-center transition-colors cursor-pointer ${
                  selectedAgeGroup === age 
                    ? 'bg-zinc-700 ring-2 ring-primary'
                    : 'hover:bg-zinc-700'
                }`}
              >
                <span className="text-sm font-medium text-primary">{age}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto space-y-6 pb-32">
          {/* Calendar Section */}
          <div className="bg-zinc-900 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="text-primary" />
                <h2 className="text-lg font-semibold">
                  {selectedAgeGroup} Calendar - {getCurrentMonth()}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePreviousWeek}
                  className="text-primary hover:bg-zinc-800 p-2 rounded-full transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={handleNextWeek}
                  className="text-primary hover:bg-zinc-800 p-2 rounded-full transition-colors"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
            
            <div className="bg-zinc-800 rounded-xl p-4">
              <div className="grid grid-cols-7 gap-2">
                {weekDays.map((day, index) => {
                  const dayStr = day.date.toISOString().split('T')[0];
                  const hasSession = Boolean(sessionData[dayStr]);
                  const isSelected = day.date.toDateString() === selectedDate.toDateString();
                  
                  return (
                    <button 
                      key={index}
                      onClick={() => setSelectedDate(day.date)}
                      className={`
                        p-3 text-center transition-all rounded-xl
                        ${isSelected
                          ? 'bg-primary text-black'
                          : day.isToday
                          ? 'bg-primary text-black'
                          : 'bg-zinc-900 hover:bg-zinc-700'
                        }
                      `}
                    >
                      <div className="text-xs mb-1 font-medium">
                        {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className={`text-lg font-semibold ${
                        (isSelected || day.isToday) ? 'text-black' : 'text-white'
                      }`}>
                        {day.date.getDate()}
                      </div>
                      {hasSession && (
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            (isSelected || day.isToday)
                              ? 'bg-black/20 text-black'
                              : 'bg-primary/20 text-primary'
                          }`}>
                            Session
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDaySession && (
              <div className="mt-4">
                <div className="bg-zinc-800 rounded-xl p-6 border-2 border-primary">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="inline-block px-3 py-1 rounded-full text-sm bg-primary/20 text-primary">
                      Session {selectedDaySession.title}
                    </span>
                    {selectedDaySession.relatedSessions && selectedDaySession.relatedSessions.length > 0 && (
                      <span className="text-sm text-zinc-400">
                        ({selectedDaySession.relatedSessions.length} related sessions)
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-2">{selectedDaySession.sessionTitle}</h3>
                      <p className="text-zinc-400 mb-4">{selectedDaySession.description}</p>
                      <div className="flex items-center gap-4 text-sm text-zinc-400">
                        <div className="flex items-center gap-1">
                          <Clock size={16} className="text-primary" />
                          <span>{selectedDaySession.duration}</span>
                        </div>
                      </div>
                      <button 
                        className="btn-primary mt-6"
                        onClick={() => handleStartSession(selectedDaySession)}
                      >
                        Start Session
                      </button>
                    </div>
                    <div className="relative h-[300px] rounded-xl overflow-hidden">
                      <div className="absolute inset-0">
                        <img 
                          src={selectedDaySession.imageUrl || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800"}
                          alt={selectedDaySession.sessionTitle}
                          className="w-full h-full object-contain bg-zinc-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Activity and Progress Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Games */}
            <div className="bg-zinc-900 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Flag className="text-primary" />
                Upcoming Games
              </h2>
              <div className="space-y-4">
                {upcomingGames.map((game, index) => (
                  <div key={index} className="bg-zinc-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">vs {game.opponent}</h3>
                      <span className="text-sm px-2 py-1 rounded-full bg-primary/20 text-primary">
                        {game.type}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-primary" />
                        <span>{new Date(game.date).toLocaleDateString()} at {game.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Flag size={14} className="text-primary" />
                        <span>{game.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress Stats */}
            <div className="bg-zinc-900 rounded-2xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Trophy className="text-primary" />
                Progress Stats
              </h2>
              <div className="space-y-4">
                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300">Sessions Completed</span>
                    <span className="text-primary font-semibold">12/24</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: '50%' }} />
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300">Training Hours</span>
                    <span className="text-primary font-semibold">18 hrs</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: '75%' }} />
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-zinc-300">Skills Mastered</span>
                    <span className="text-primary font-semibold">8/12</span>
                  </div>
                  <div className="w-full bg-zinc-700 rounded-full h-2">
                    <div className="bg-primary rounded-full h-2" style={{ width: '66%' }} />
                  </div>
                </div>

                <div className="bg-zinc-800 rounded-xl p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Target className="text-primary" size={16} />
                    Current Goals
                  </h3>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      Complete Basic Dribbling Series
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      Master First Touch Control
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      Improve Passing Accuracy
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedSession && (
        <SessionModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSession(null);
          }}
          title={selectedSession.title}
          sessionTitle={selectedSession.sessionTitle}
          imageUrl={selectedSession.imageUrl}
          description={selectedSession.description}
          coachingPoints={selectedSession.coachingPoints}
          duration={selectedSession.duration}
          level={selectedSession.level}
          ageGroups={selectedSession.ageGroups}
          sessionNumber={selectedSession.title}
          relatedSessions={selectedSession.relatedSessions}
        />
      )}

      <BottomNav />
    </div>
  );
}