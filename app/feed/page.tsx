import ActivityCard from '@/app/app-components/ActivityCard';

export default function FeedPage() {
  const feedItems = [
    { id: 1, thumbnail: 'https://via.placeholder.com/150', title: 'Workout Session', description: 'Completed a 30-minute HIIT workout.' },
    { id: 2, thumbnail: 'https://via.placeholder.com/150', title: 'Meal Prep', description: 'Prepared healthy meals for the week.' },
    { id: 3, thumbnail: 'https://via.placeholder.com/150', title: 'Yoga Practice', description: 'Relaxing yoga session for flexibility.' },
    { id: 4, thumbnail: 'https://via.placeholder.com/150', title: 'Running', description: 'Morning run, 5km in 25 minutes.' },
    { id: 5, thumbnail: 'https://via.placeholder.com/150', title: 'Weight Training', description: 'Upper body strength training.' },
    { id: 6, thumbnail: 'https://via.placeholder.com/150', title: 'Cycling', description: 'Evening bike ride, 10km.' },
    { id: 7, thumbnail: 'https://via.placeholder.com/150', title: 'Meditation', description: '15 minutes of mindfulness meditation.' },
    { id: 8, thumbnail: 'https://via.placeholder.com/150', title: 'Swimming', description: 'Laps in the pool for an hour.' },
    { id: 9, thumbnail: 'https://via.placeholder.com/150', title: 'Hiking', description: 'Explored a new trail.' },
    { id: 10, thumbnail: 'https://via.placeholder.com/150', title: 'Pilates', description: 'Core strengthening exercises.' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-app)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-[var(--text-primary)] mb-8">
          Your Feed
        </h1>
        <div className="space-y-4">
          {feedItems.map((activity, index) => (
            <ActivityCard key={activity.id} activity={activity} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}
