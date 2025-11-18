"use client";

import AnimatedItem from './AnimatedList';
import styles from './ActivityCard.module.css';

interface Activity {
  id: number;
  thumbnail: string;
  title: string;
  description: string;
  user?: string;
}

interface ActivityCardProps {
  activity: Activity;
  index: number;
}

const ActivityCard = ({ activity, index }: ActivityCardProps) => {
  return (
    <AnimatedItem index={index}>
      <div key={activity.id} className={styles.activityCard}>
        <img src={activity.thumbnail} alt={activity.title} className={styles.thumbnail} />
        <div className={styles.content}>
          <h3 className={styles.cardTitle}>{activity.user ? `${activity.user}'s ${activity.title}` : activity.title}</h3>
          <p className={styles.cardDescription}>{activity.description}</p>
        </div>
      </div>
    </AnimatedItem>
  );
};

export default ActivityCard;
