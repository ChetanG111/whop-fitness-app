'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import styles from './page.module.css';

import Heatmap from '../../components/Heatmap';
import LogFlow from '../../components/LogFlow';

const YourActivityPage = () => {
  const [activeView, setActiveView] = useState('You');
  const [pillStyle, setPillStyle] = useState({});
  const feedRef = useRef<HTMLButtonElement>(null);
  const youRef = useRef<HTMLButtonElement>(null);
  const [isLogFlowOpen, setIsLogFlowOpen] = useState(false);


  useEffect(() => {
    const activeRef = activeView === 'Feed' ? feedRef : youRef;
    if (activeRef.current) {
      setPillStyle({
        width: activeRef.current.offsetWidth,
        left: activeRef.current.offsetLeft,
      });
    }
  }, [activeView]);





  const activityData = [
    { id: 1, thumbnail: 'https://dummyimage.com/120x120/3DD9D9/0F1419.png&text=W', title: 'Push Day', description: 'Chest, Shoulders, Triceps' },
    { id: 2, thumbnail: 'https://dummyimage.com/120x120/E57373/0F1419.png&text=R', title: 'Active Recovery', description: 'Light walk and stretching' },
    { id: 3, thumbnail: 'https://dummyimage.com/120x120/D4C5B0/0F1419.png&text=Ref', title: 'Reflection', description: 'Feeling a bit under the weather.' },
    { id: 4, thumbnail: 'https://dummyimage.com/120x120/87CEEB/0F1419.png&text=C', title: 'Core Blast', description: 'Planks, leg raises, Russian twists' },
    { id: 5, thumbnail: 'https://dummyimage.com/120x120/98FB98/0F1419.png&text=L', title: 'Leg Day', description: 'Squats, lunges, calf raises' },
    { id: 6, thumbnail: 'https://dummyimage.com/120x120/FFA07A/0F1419.png&text=HIIT', title: 'HIIT Session', description: '20-min intervals, full-body' },
    { id: 7, thumbnail: 'https://dummyimage.com/120x120/AFEEEE/0F1419.png&text=Y', title: 'Yoga Flow', description: 'Mobility and breathwork' },
    { id: 8, thumbnail: 'https://dummyimage.com/120x120/BA55D3/0F1419.png&text=F', title: 'Functional', description: 'Kettlebell swings, box jumps' },
    { id: 9, thumbnail: 'https://dummyimage.com/120x120/FFD700/0F1419.png&text=C', title: 'Cycling', description: '45-min endurance ride' },
    { id: 10, thumbnail: 'https://dummyimage.com/120x120/40E0D0/0F1419.png&text=S', title: 'Swim', description: 'Technique and intervals' },
  ];

  const publicFeedData = [
    { id: 1, user: 'Jane', thumbnail: 'https://dummyimage.com/120x120/3DD9D9/0F1419.png&text=W', title: 'Pull Day', description: 'Back and Biceps' },
    { id: 2, user: 'John', thumbnail: 'https://dummyimage.com/120x120/D4C5B0/0F1419.png&text=R', title: 'Rest Day', description: 'Full day of rest and recovery.' },
    { id: 3, user: 'Ava', thumbnail: 'https://dummyimage.com/120x120/87CEEB/0F1419.png&text=C', title: 'Core Blast', description: 'Pilates inspired core work' },
    { id: 4, user: 'Liam', thumbnail: 'https://dummyimage.com/120x120/98FB98/0F1419.png&text=L', title: 'Leg Day', description: 'Heavy squats and accessories' },
    { id: 5, user: 'Mia', thumbnail: 'https://dummyimage.com/120x120/FFA07A/0F1419.png&text=HIIT', title: 'HIIT Session', description: 'Short and spicy intervals' },
    { id: 6, user: 'Noah', thumbnail: 'https://dummyimage.com/120x120/AFEEEE/0F1419.png&text=Y', title: 'Yoga Flow', description: 'Evening unwind sequence' },
    { id: 7, user: 'Olivia', thumbnail: 'https://dummyimage.com/120x120/BA55D3/0F1419.png&text=F', title: 'Functional', description: 'EMOM kettlebell complex' },
    { id: 8, user: 'Ethan', thumbnail: 'https://dummyimage.com/120x120/FFD700/0F1419.png&text=C', title: 'Cycling', description: 'Climb repeats' },
    { id: 9, user: 'Sophia', thumbnail: 'https://dummyimage.com/120x120/40E0D0/0F1419.png&text=S', title: 'Swim', description: 'Drills + pull buoy set' },
    { id: 10, user: 'Lucas', thumbnail: 'https://dummyimage.com/120x120/E6E6FA/0F1419.png&text=WU', title: 'Warm-up', description: 'Dynamic mobility and prep' },
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



  const renderYouView = () => {
    // Calculate date range for ~1 month of data (35 days to show 5 weeks)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 34);

    return (
      <motion.div key="you" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <h1 className={styles.pageTitle}>Your Activity</h1>
        <h2 className={styles.sectionLabel}>This Year</h2>
        <Heatmap />
        <h2 className={`${styles.sectionLabel} ${styles.sectionLabelTopPad}`}>Recent Check-ins</h2>
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

      {isLogFlowOpen && <LogFlow onClose={() => setIsLogFlowOpen(false)} />}

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
        <motion.button className={styles.navIcon} whileTap={{ scale: 0.9, opacity: 0.8 }} onClick={() => setIsLogFlowOpen(true)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

export default YourActivityPage;