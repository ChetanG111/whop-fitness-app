'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import styles from './page.module.css';

const YourActivityPage = () => {
  const [activeView, setActiveView] = useState('You');
  const [pillStyle, setPillStyle] = useState({});
  const feedRef = useRef<HTMLButtonElement>(null);
  const youRef = useRef<HTMLButtonElement>(null);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [transformedHeatmapData, setTransformedHeatmapData] = useState<{ date: string | Date; count: number }[]>([]);

  useEffect(() => {
    const activeRef = activeView === 'Feed' ? feedRef : youRef;
    if (activeRef.current) {
      setPillStyle({
        width: activeRef.current.offsetWidth,
        left: activeRef.current.offsetLeft,
      });
    }
  }, [activeView]);

  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const headers: Record<string, string> = {};
        if (process.env.NODE_ENV === 'development') {
          headers['X-Test-User-Id'] = process.env.NEXT_PUBLIC_TEST_USER_ID || 'user_12345';
        }
        const res = await fetch('/api/calendar', { headers });
        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await res.json() : null;

        if (!res.ok) {
          console.warn('Calendar API returned non-OK:', res.status, payload);
          setHeatmapData([]);
          return;
        }

        if (Array.isArray(payload)) {
          console.log('API response for heatmap data:', payload);
          setHeatmapData(payload);
        } else {
          console.warn('Calendar API payload not an array. Using empty array.', payload);
          setHeatmapData([]);
        }
      } catch (error) {
        console.error('Error fetching heatmap data:', error);
      }
    };

    fetchHeatmapData();
  }, []);

  useEffect(() => {
    if (Array.isArray(heatmapData)) { // Explicitly check if it's an array
      const transformedData = heatmapData.map((checkin: any) => ({
        date: checkin.createdAt,
        count: 1, // We can use the `getHeatmapClass` to determine the color
      }));
      setTransformedHeatmapData(transformedData);
    } else {
      console.error('heatmapData is not an array:', heatmapData);
      setTransformedHeatmapData([]); // Ensure it's always an array
    }
  }, [heatmapData]);

  const activityData = [
    { id: 1, thumbnail: 'https://dummyimage.com/120x120/3DD9D9/0F1419.png&text=W', title: 'Push Day', description: 'Chest, Shoulders, Triceps' },
    { id: 2, thumbnail: 'https://dummyimage.com/120x120/E57373/0F1419.png&text=R', title: 'Active Recovery', description: 'Light walk and stretching' },
    { id: 3, thumbnail: 'https://dummyimage.com/120x120/D4C5B0/0F1419.png&text=Ref', title: 'Reflection', description: 'Feeling a bit under the weather.' },
  ];

  const publicFeedData = [
    { id: 1, user: 'Jane', thumbnail: 'https://dummyimage.com/120x120/3DD9D9/0F1419.png&text=W', title: 'Pull Day', description: 'Back and Biceps' },
    { id: 2, user: 'John', thumbnail: 'https://dummyimage.com/120x120/D4C5B0/0F1419.png&text=R', title: 'Rest Day', description: 'Full day of rest and recovery.' },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.18,
        ease: 'easeOut' as const,
      },
    }),
  };

  const getHeatmapClass = (value: any) => {
    if (!value) {
      return styles.heatmapCellEmpty;
    }
    // Find the original checkin object from heatmapData
    const originalCheckin = heatmapData.find((checkin: any) => checkin.createdAt === value.date);
    if (!originalCheckin) {
      return styles.heatmapCellEmpty;
    }
    switch ((originalCheckin as any).type) {
      case 'WORKOUT':
        return styles.heatmapCellHigh;
      case 'REST':
        return styles.heatmapCellMedium;
      case 'REFLECTION':
        return styles.heatmapCellLow;
      default:
        return styles.heatmapCellEmpty;
    }
  };

  const renderYouView = () => {
    // Calculate date range for ~1 month of data (35 days to show 5 weeks)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 34);

    return (
      <motion.div key="you" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <h1 className={styles.pageTitle}>Your Activity</h1>
        <h2 className={styles.sectionLabel}>This Month</h2>
        <div className={styles.heatmapContainer}>
          <CalendarHeatmap
            startDate={startDate}
            endDate={endDate}
            values={transformedHeatmapData}
            classForValue={getHeatmapClass}
				showWeekdayLabels={false}
            gutterSize={0}
          />
        </div>
        <h2 className={styles.sectionLabel}>Recent Check-ins</h2>
        <div className={styles.cardList}>
          {activityData.map((activity, i) => (
            <motion.div
              key={activity.id}
              className={styles.activityCard}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              whileTap={{ scale: 0.97, opacity: 0.85 }}
            >
              <img src={activity.thumbnail} alt={activity.title} className={styles.thumbnail} />
              <div className={styles.content}>
                <h3 className={styles.cardTitle}>{activity.title}</h3>
                <p className={styles.cardDescription}>{activity.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  };

  const renderFeedView = () => (
    <motion.div key="feed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <h1 className={styles.pageTitle}>Public Feed</h1>
      <div className={styles.cardList}>
        {publicFeedData.map((activity, i) => (
          <motion.div
            key={activity.id}
            className={styles.activityCard}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={cardVariants}
            whileTap={{ scale: 0.97, opacity: 0.85 }}
          >
            <img src={activity.thumbnail} alt={activity.title} className={styles.thumbnail} />
            <div className={styles.content}>
              <h3 className={styles.cardTitle}>{activity.user}'s {activity.title}</h3>
              <p className={styles.cardDescription}>{activity.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {activeView === 'You' ? renderYouView() : renderFeedView()}
      </AnimatePresence>

      <div className={styles.bottomNav}>
        <motion.button className={styles.navIcon} whileTap={{ scale: 0.9, opacity: 0.8 }}>
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
        <motion.button className={styles.navIcon} whileTap={{ scale: 0.9, opacity: 0.8 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default YourActivityPage;