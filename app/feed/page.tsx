import AnimatedList from '@/components/AnimatedList';

export default function FeedPage() {
  const feedItems = [
    'First item in the feed',
    'Second item in the feed',
    'Third item in the feed',
    'Fourth item in the feed',
    'Fifth item in the feed',
    'Sixth item in the feed',
    'Seventh item in the feed',
    'Eighth item in the feed',
    'Ninth item in the feed',
    'Tenth item in the feed',
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          Your Feed
        </h1>
        <AnimatedList items={feedItems} />
      </div>
    </div>
  );
}
