import React, { useState } from 'react';
import styles from './LogFlow.module.css';

interface LogFlowProps {
  onClose: () => void;
}

const LogFlow = ({ onClose }: LogFlowProps) => {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [isPublicPhoto, setIsPublicPhoto] = useState(false);

  const handleSelection = (type: string) => {
    setSelection(type);
    setStep(1);
  };

  const renderSelectionScreen = () => (
    <div className={styles.screen}>
      <div className={styles.stack}>
        <button className={styles.button} onClick={() => handleSelection('Workout')}>Workout</button>
        <button className={styles.button} onClick={() => handleSelection('Rest')}>Rest</button>
        <button className={styles.button} onClick={() => handleSelection('Reflect')}>Reflect</button>
      </div>
      <div className={styles.pageDots}>
        <span className={`${styles.dot} ${styles.activeDot}`}></span>
        <span className={styles.dot}></span>
        <span className={styles.dot}></span>
      </div>
    </div>
  );

  const renderDetailNoteScreen = () => (
    <div className={styles.screen}>
      <div className={styles.stack}>
        {selection === 'Workout' ? (
          <select className={styles.select} value={workoutType} onChange={(e) => setWorkoutType(e.target.value)}>
            <option value="" disabled>Select workout type</option>
            <option value="Push">Push</option>
            <option value="Pull">Pull</option>
            <option value="Legs">Legs</option>
            <option value="Upper">Upper</option>
            <option value="Lower">Lower</option>
            <option value="Full">Full</option>
          </select>
        ) : (
          <button className={styles.secondaryButton}>{selection}</button>
        )}
        <textarea className={styles.input} placeholder="Insert note"></textarea>
        <div className={styles.row}>
          <span>Public Note</span>
          <div className={`${styles.toggle} ${isPublicNote ? styles.toggleOn : ''}`} onClick={() => setIsPublicNote(!isPublicNote)}></div>
        </div>
      </div>
      <div className={styles.footer}>
        <button className={styles.navArrow} onClick={() => setStep(0)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className={styles.pageDots}>
          <span className={styles.dot}></span>
          <span className={`${styles.dot} ${styles.activeDot}`}></span>
          <span className={styles.dot}></span>
        </div>
        <button className={styles.fab} onClick={() => setStep(2)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );

  const renderPhotoScreen = () => (
    <div className={styles.screen}>
      <div className={styles.stack}>
        <div className={styles.dashedBox}>
            <p>Upload Photo</p>
        </div>
        <div className={styles.row}>
          <span>Public Photo</span>
          <div className={`${styles.toggle} ${isPublicPhoto ? styles.toggleOn : ''}`} onClick={() => setIsPublicPhoto(!isPublicPhoto)}></div>
        </div>
        <button className={styles.button}>Upload Photo</button>
      </div>
      <div className={styles.footer}>
        <button className={styles.navArrow} onClick={() => setStep(1)}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div className={styles.pageDots}>
            <span className={styles.dot}></span>
            <span className={styles.dot}></span>
            <span className={`${styles.dot} ${styles.activeDot}`}></span>
        </div>
        <button className={styles.primaryMini} onClick={onClose}>Log</button>
      </div>
    </div>
  );

  const screens = [renderSelectionScreen(), renderDetailNoteScreen(), renderPhotoScreen()];

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {screens[step]}
      </div>
    </div>
  );
};

export default LogFlow;
