import React, { useState } from 'react';
import styles from './ProfileView.module.css';

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
    <div className={styles.container}>
      <button className={styles.closeButton} onClick={onClose} aria-label="Close">
        &times;
      </button>
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
        <button className={styles.submitButton} onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
