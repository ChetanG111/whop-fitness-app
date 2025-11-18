'use client';

import { useState, useRef, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import styles from './page.module.css';

import Heatmap from '../../app-components/Heatmap';
import LogFlow from '../../app-components/LogFlow';
import ProfileView from '../../app-components/ProfileView';

import ActivityCard from '../../app-components/ActivityCard';

// Memoize to prevent unnecessary re-renders
const MemoActivityCard = memo(ActivityCard);

interface YourActivityPageProps {
  userId: string | null;
}

const YourActivityPage = ({ userId }: YourActivityPageProps) => {
	const [activeView, setActiveView] = useState('You');
  const [pillStyle, setPillStyle] = useState({});
  const feedRef = useRef<HTMLButtonElement>(null);
  const youRef = useRef<HTMLButtonElement>(null);
  const [isLogFlowOpen, setIsLogFlowOpen] = useState(false);
  const [isProfileViewOpen, setIsProfileViewOpen] = useState(false);
  const [checkinError, setCheckinError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: userLogs, isLoading, error: userLogsError } = useQuery({
    queryKey: ['userLogs', userId],
    queryFn: async () => {
      const headers: HeadersInit = {};
      if (process.env.NODE_ENV === 'development') {
        headers['X-Test-User-Id'] = 'test-user-123';
      } 

      const res = await fetch('/api/checkins', { headers });
      if (!res.ok) {
        throw new Error('Failed to fetch user logs');
      }
      const data = await res.json();
      
      // Transform checkins to match ActivityCard format
      return data.checkins.map((checkin: any) => {
        let thumbnail = '';
        let title = '';
        let description = checkin.note || '';
        
        if (checkin.type === 'WORKOUT') {
          thumbnail = 'https://dummyimage.com/120x120/3DD9D9/0F1419.png&text=W';
          title = `Test User: ${checkin.muscleGroup || 'Workout'}`;
          description = checkin.note || 'Completed workout';
        } else if (checkin.type === 'REST') {
          thumbnail = 'https://dummyimage.com/120x120/E57373/0F1419.png&text=R';
          title = 'Test User: Rest Day';
          description = checkin.note || 'Active recovery';
        } else if (checkin.type === 'REFLECTION') {
          thumbnail = 'https://dummyimage.com/120x120/D4C5B0/0F1419.png&text=Ref';
          title = 'Test User: Reflection';
          description = checkin.note || 'Daily reflection';
        }
        
        return {
          id: checkin.id,
          thumbnail,
          title,
          description,
        };
      });
    },
	 enabled: !!userId || process.env.NODE_ENV === 'development',
  });

  const { data: feedLogs, isLoading: feedLoading, error: feedError } = useQuery({
    queryKey: ['feedLogs', userId],
    queryFn: async () => {
      const headers: HeadersInit = {};
      if (process.env.NODE_ENV === 'development') {
        headers['X-Test-User-Id'] = 'test-user-123';
      } 
            // Note: In production, Whop automatically adds x-whop-user-id header
      const res = await fetch('/api/feed', { headers });
      if (!res.ok) {
        throw new Error('Failed to fetch feed');
      }
      const data = await res.json();
      
      // Transform feed checkins to match ActivityCard format
      return data.map((checkin: any) => {
        let thumbnail = '';
        let title = '';
        let description = checkin.note || '';
        
        if (checkin.type === 'WORKOUT') {
          thumbnail = 'https://dummyimage.com/120x120/3DD9D9/0F1419.png&text=W';
          title = `${checkin.user.name}: ${checkin.muscleGroup || 'Workout'}`;
          description = checkin.note || 'Completed workout';
        } else if (checkin.type === 'REST') {
          thumbnail = 'https://dummyimage.com/120x120/E57373/0F1419.png&text=R';
          title = `${checkin.user.name}: Rest Day`;
          description = checkin.note || 'Active recovery';
        } else if (checkin.type === 'REFLECTION') {
          thumbnail = 'https://dummyimage.com/120x120/D4C5B0/0F1419.png&text=Ref';
          title = `${checkin.user.name}: Reflection`;
          description = checkin.note || 'Daily reflection';
        }
        
        return {
          id: checkin.id,
          thumbnail,
          title,
          description,
        };
      });
    },
	     enabled: !!userId || process.env.NODE_ENV === 'development', // Only run query if we have a userId
  });

  useEffect(() => {
    const activeRef = activeView === 'Feed' ? feedRef : youRef;
    if (activeRef.current) {
      setPillStyle({
        width: activeRef.current.offsetWidth,
        left: activeRef.current.offsetLeft,
      });
    }
  }, [activeView]);
  
  const renderYouView = () => {
    if (isLoading) return <p>Loading...</p>;
    if (userLogsError) return <p>Error loading activity: {(userLogsError as Error).message}</p>;

    return (
      <motion.div key="you" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 className={styles.pageTitle}>Your Activity</h1>
          {process.env.NODE_ENV === 'development' && (
            <button 
              onClick={async () => {
                if (!confirm('Clear all check-ins? This cannot be undone.')) return;
                try {
                  const headers: HeadersInit = {};
                  if (process.env.NODE_ENV === 'development') {
                    headers['X-Test-User-Id'] = 'test-user-123';
                  }
                  const res = await fetch('/api/checkins', { method: 'DELETE', headers });
                  if (res.ok) {
                    queryClient.invalidateQueries({ queryKey: ['userLogs'] });
                    setCheckinError(null);
                  }
                } catch (error) {
                  console.error('Failed to clear checkins:', error);
                }
              }}
              style={{
                padding: '8px 16px',
                backgroundColor: '#E57373',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Clear All
            </button>
          )}
        </div>
        <Heatmap />
        <AnimatePresence mode='popLayout'>
          <div className={styles.cardList}>
            {userLogs?.map((activity: any, i: number) => (
              <div key={activity.id} className={styles.cardListItem}>
                <MemoActivityCard activity={activity} index={i} />
              </div>
            ))}
          </div>
        </AnimatePresence>
      </motion.div>
    );
  };




  const renderFeedView = () => {
    if (feedLoading) return <p>Loading...</p>;
    if (feedError) return <p>Error loading feed</p>;

    return (
      <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <h1 className={styles.pageTitle}>Public Feed</h1>
        <div className={styles.cardList}>
          {feedLogs?.map((activity: any, i: number) => (
            <div key={activity.id} className={styles.cardListItem}>
              <MemoActivityCard activity={activity} index={i} />
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className={styles.container}>
      {checkinError && (
        <div style={{ 
          position: 'fixed', 
          top: '16px', 
          left: '50%', 
          transform: 'translateX(-50%)', 
          zIndex: 1000, 
          padding: '12px 24px', 
          backgroundColor: '#E57373', 
          color: '#fff', 
          borderRadius: '8px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: '90%',
          textAlign: 'center'
        }}>
          {checkinError}
        </div>
      )}
      <AnimatePresence mode="wait">
        {activeView === 'You' ? renderYouView() : renderFeedView()}
      </AnimatePresence>

      {isLogFlowOpen && <LogFlow 
        onClose={() => {
          setIsLogFlowOpen(false);
          queryClient.invalidateQueries({ queryKey: ['userLogs'] });
        }} 
      />}
      {isProfileViewOpen && <ProfileView onClose={() => setIsProfileViewOpen(false)} />}

      <div className={styles.bottomNav}>
        <motion.button className={styles.navIcon} whileTap={{ scale: 0.9, opacity: 0.8 }} onClick={() => setIsProfileViewOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
        <div className={styles.centerPillContainer}>
          <motion.div className={styles.activePill} animate={pillStyle} transition={{ duration: 0.2, ease: 'easeOut' }} />
          <button ref={feedRef} className={styles.navItem} onClick={() => setActiveView('Feed')} style={{ color: activeView === 'Feed' ? '#0F1419' : '#9CA3AF' }}>Feed</button>
          <button ref={youRef} className={styles.navItem} onClick={() => setActiveView('You')} style={{ color: activeView === 'You' ? '#0F1419' : '#9CA3AF' }}>You</button>
        </div>
        <motion.button className={styles.navIcon} whileTap={{ scale: 0.9, opacity: 0.8 }} onClick={async () => {
          // Check if user already checked in today
          try {
            const headers: HeadersInit = {};
            if (process.env.NODE_ENV === 'development') {
              headers['X-Test-User-Id'] = 'test-user-123';
            }
            
            const res = await fetch('/api/checkins', { headers });
            if (res.ok) {
              const data = await res.json();
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              
              const hasCheckedInToday = data.checkins?.some((checkin: any) => {
                const checkinDate = new Date(checkin.createdAt);
                checkinDate.setHours(0, 0, 0, 0);
                return checkinDate.getTime() === today.getTime();
              });
              
              if (hasCheckedInToday) {
                setCheckinError('You have already checked in today.');
                setTimeout(() => setCheckinError(null), 3000); // Auto-dismiss after 3s
                return; // Don't open LogFlow
              } else {
                setCheckinError(null);
              }
            }
          } catch (error) {
            // If check fails, allow them to try (server will validate)
            setCheckinError(null);
          }
          setIsLogFlowOpen(true);
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default YourActivityPage;