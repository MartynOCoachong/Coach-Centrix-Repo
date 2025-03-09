import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useGoogleSheets } from '../lib/googleSheets';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import SessionCard from '../components/SessionCard';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface DrillData {
  title: string;
  sessionTitle: string;
  imageUrl: string;
  description: string;
  coachingPoints: string[];
  duration: string;
  level: string;
  ageGroups: string[];
  relatedSessions?: DrillData[];
}

export default function Session() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { data: sheetData, loading: sheetsLoading, error: sheetsError } = useGoogleSheets();
  const [loading, setLoading] = useState(true);
  const [drills, setDrills] = useState<DrillData[]>([]);

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
      const allDrills = sheetData.values.slice(1).map(row => ({
        title: row[0] || '',
        sessionTitle: row[1] || '',
        description: row[2] || '',
        coachingPoints: (row[6] || '').split('\n').filter(Boolean),
        duration: row[4] || '',
        level: row[5] || '',
        ageGroups: (row[3] || '').split(',').map(group => group.trim()),
        imageUrl: row[7] || '',
      }));

      const mainDrills = allDrills.filter(drill => {
        const number = drill.title.trim();
        return /^\d+$/.test(number) && !number.match(/[a-zA-Z]/);
      });
      
      const drillsWithRelated = mainDrills.map(mainDrill => {
        const mainNumber = mainDrill.title.trim();
        const related = allDrills.filter(drill => {
          const drillNumber = drill.title.trim();
          return new RegExp(`^${mainNumber}[A-Za-z]$`).test(drillNumber);
        });
        
        return {
          ...mainDrill,
          relatedSessions: related,
        };
      });

      const sortedDrills = drillsWithRelated.sort((a, b) => {
        const numA = parseInt(a.title.trim());
        const numB = parseInt(b.title.trim());
        return numA - numB;
      });

      setDrills(sortedDrills);
    }
  }, [sheetData]);

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
        <div className="text-red-500">{sheetsError}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header profile={profile} />

      <div className="px-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Training Sessions</h1>
          <p className="text-zinc-400">Choose a session to begin training</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {drills.map((drill, index) => (
              <SessionCard 
                key={index} 
                {...drill} 
                sessionNumber={drill.sessionTitle}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}