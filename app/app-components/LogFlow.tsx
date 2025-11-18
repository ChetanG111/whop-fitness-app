"use client";
import React, { useState, useRef } from 'react';
import styles from './LogFlow.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface LogFlowProps {
  onClose: () => void;
  initialError?: string | null;
}

const LogFlow = ({ onClose, initialError }: LogFlowProps) => {
  const [step, setStep] = useState(0);
  const [selection, setSelection] = useState('');
  const [workoutType, setWorkoutType] = useState('');
  const [note, setNote] = useState(''); // Added state for note
  const [isPublicNote, setIsPublicNote] = useState(false);
  const [isPublicPhoto, setIsPublicPhoto] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClient = useQueryClient();

  const logMutation = useMutation({
    mutationFn: async (logData: any) => {
      let endpoint = '';
      if (logData.type === 'Workout') {
        endpoint = '/api/checkin/workout';
      } else if (logData.type === 'Rest') {
        endpoint = '/api/checkin/rest';
      } else if (logData.type === 'Reflect') {
        endpoint = '/api/checkin/reflection';
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      // Allow explicit test user in both dev and prod using env
      if (process.env.NEXT_PUBLIC_TEST_USER_ID) {
        headers['X-Test-User-Id'] = process.env.NEXT_PUBLIC_TEST_USER_ID as string;
      } else if (process.env.NODE_ENV === 'development') {
        headers['X-Test-User-Id'] = 'test-user-123';
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(logData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to log activity');
      }
      return response.json();
    },
    onMutate: async (newLog) => {
      // Optimistic update logic (C8)
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['userLogs'] });
      await queryClient.cancelQueries({ queryKey: ['feedLogs'] });

      // Snapshot the previous value
      const previousUserLogs = queryClient.getQueryData(['userLogs']);
      const previousFeedLogs = queryClient.getQueryData(['feedLogs']);

      // Optimistically update to the new value
      queryClient.setQueryData(['userLogs'], (old: any) => {
        const optimisticLog = {
          ...newLog,
          id: 'optimistic-id', // Temporary ID
          created_at: new Date().toISOString(),
          user: { id: 'current-user-id', name: 'You', avatarUrl: null }, // Placeholder user
        };
        return old ? [optimisticLog, ...old] : [optimisticLog];
      });

      if (newLog.type === 'Workout' && newLog.sharedPhoto) { // Assuming sharedPhoto is isPublic
        queryClient.setQueryData(['feedLogs'], (old: any) => {
          const optimisticLog = {
            ...newLog,
            id: 'optimistic-id', // Temporary ID
            created_at: new Date().toISOString(),
            user: { id: 'current-user-id', name: 'You', avatarUrl: null }, // Placeholder user
          };
          return old ? [optimisticLog, ...old] : [optimisticLog];
        });
      }

      return { previousUserLogs, previousFeedLogs };
    },
    onError: (err, newLog, context) => {
      // Rollback on error (C8)
      queryClient.setQueryData(['userLogs'], context?.previousUserLogs);
      queryClient.setQueryData(['feedLogs'], context?.previousFeedLogs);
      // Show error message
      setErrorMessage(err.message);
      // Don't log to console to avoid console errors
    },
    onSuccess: () => {
      // Close modal on success
      onClose();
    },
    onSettled: () => {
      // Invalidate and refetch (C9)
      queryClient.invalidateQueries({ queryKey: ['userLogs'] });
      queryClient.invalidateQueries({ queryKey: ['feedLogs'] });
    },
  });


  const handleSelection = (type: string) => {
    setSelection(type);
    setStep(1);
  };

  const renderSelectionScreen = () => (
    <div className={styles.screen}>
      {errorMessage && (
        <div style={{ padding: '12px', backgroundColor: '#E57373', color: '#fff', borderRadius: '8px', marginBottom: '16px', textAlign: 'center' }}>
          {errorMessage}
        </div>
      )}
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
        <textarea className={styles.input} placeholder="Insert note" value={note} onChange={(e) => setNote(e.target.value)}></textarea>
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderPhotoScreen = () => (
    <div className={styles.screen}>
      <div className={styles.stack}>
        <div
          className={uploadedImage ? styles.dashedBoxWithImage : styles.dashedBox}
          onClick={() => !uploadedImage && fileInputRef.current?.click()}
        >
          {uploadedImage ? (
            <img src={uploadedImage} alt="Uploaded" className={styles.uploadedImage} />
          ) : (
            <p>Upload Photo</p>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />
        <div className={styles.row}>
          <span>Public Photo</span>
          <div className={`${styles.toggle} ${isPublicPhoto ? styles.toggleOn : ''}`} onClick={() => setIsPublicPhoto(!isPublicPhoto)}></div>
        </div>
        <button className={styles.button} onClick={() => fileInputRef.current?.click()}>Upload Photo</button>
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
        <button
          className={styles.primaryMini}
          onClick={() => {
            const payload: any = {
              type: selection,
              note: note,
              sharedNote: isPublicNote, // Send public note preference
              timestamp: new Date().toISOString(),
            };
            if (selection === 'Workout') {
              payload.muscleGroup = workoutType;
              payload.sharedPhoto = isPublicPhoto; // Use isPublicPhoto for workout visibility
            } else {
              // Rest and Reflect logs are never public, so no sharedPhoto for them
              payload.sharedPhoto = false;
            }
            logMutation.mutate(payload);
          }}
          disabled={logMutation.isPending}
        >
          {logMutation.isPending ? 'Logging...' : 'Log'}
        </button>
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
