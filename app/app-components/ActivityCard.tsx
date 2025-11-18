import { motion } from 'framer-motion';
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

const ActivityCard = ({ activity, index }: ActivityCardProps) => {
  return (
    <motion.div
      key={activity.id}
      className={styles.activityCard}
      custom={index}
      initial="hidden"
      animate="visible"
      variants={cardVariants}
      whileTap={{ scale: 0.97, opacity: 0.85 }}
    >
      <img src={activity.thumbnail} alt={activity.title} className={styles.thumbnail} />
      <div className={styles.content}>
        <h3 className={styles.cardTitle}>{activity.user ? `${activity.user}'s ${activity.title}` : activity.title}</h3>
        <p className={styles.cardDescription}>{activity.description}</p>
      </div>
    </motion.div>
  );
};

export default ActivityCard;
