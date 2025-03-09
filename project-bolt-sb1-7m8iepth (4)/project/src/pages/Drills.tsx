import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useGoogleSheets } from '../lib/googleSheets';
import BottomNav from '../components/BottomNav';
import Header from '../components/Header';
import DrillCard from '../components/DrillCard';

interface Profile {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

interface DrillData {
  title: string;
  imageUrl: string;
  description: string;
  duration: string;
  ageGroups: string[];
  drillType: string;
  coachingPoints: string[];
}

export default function Drills() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const { data: sheetData, loading: sheetsLoading, error: sheetsError } = useGoogleSheets('Drills!A1:Z1000');
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
        imageUrl: row[8] || '', // Column I
        title: row[1] || '', // Column B
        description: row[2] || '', // Column C
        duration: row[3] || '', // Column D
        ageGroups: (row[5] || '').split(',').map(group => group.trim()), // Column F
        drillType: row[6] || '', // Column G
        coachingPoints: (row[7] || '').split('\n').filter(Boolean), // Column H
      }));

      const sortedDrills = allDrills.sort((a, b) => a.title.localeCompare(b.title));
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
          <h1 className="text-2xl font-bold mb-2">Training Drills</h1>
          <p className="text-zinc-400">Browse individual training drills</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-32">
            {drills.map((drill, index) => (
              <DrillCard 
                key={index}
                {...drill}
              />
            ))}
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}