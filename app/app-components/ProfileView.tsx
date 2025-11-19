import React, { useState } from 'react';
import styles from './ProfileView.module.css';
import { motion } from 'framer-motion';

interface ProfileViewProps {
  onClose: () => void;
  initialName?: string;
  initialGoals?: string;
}

const ProfileView = ({ onClose, initialName = '', initialGoals = '' }: ProfileViewProps) => {
  const [name, setName] = useState(initialName);
  const [goals, setGoals] = useState(initialGoals);

  const handleSave = () => {
    // Here you would typically save the data, e.g., via an API call
    console.log('Saving profile data:', { name, goals });
    onClose(); // Close the view after saving
  };

  return (
    <motion.div
      className={styles.container}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ duration: 0.6, ease: [0.7, 0, 0.3, 1] }}
    >
      <motion.button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close"
        whileHover={{ scale: 1.05, opacity: 0.8 }}
        whileTap={{ scale: 0.9, opacity: 0.7 }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </motion.button>
      <div className={styles.formGroup}>
        <input
          type="text"
          className={styles.textInput}
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          className={styles.textArea}
          placeholder="My Fitness goals are..."
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
        />
        <motion.button
          className={styles.submitButton}
          onClick={handleSave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Save
        </motion.button>
      </div>
    </motion.div>
  );
};

export default ProfileView;
