import { ArrowLeft, Play, Clock, TrendingUp, Heart } from 'lucide-react';

interface ExerciseVideosProps {
  onBack: () => void;
}

export function ExerciseVideos({ onBack }: ExerciseVideosProps) {
  const categories = ['All', 'Cardio', 'Strength', 'Yoga', 'HIIT', 'Pilates'];

  const videos = [
    {
      title: '30-Min Full Body HIIT',
      instructor: 'Sarah Johnson',
      duration: '30 min',
      difficulty: 'Advanced',
      calories: 350,
      thumbnail: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=400&h=250&fit=crop',
      category: 'HIIT',
    },
    {
      title: 'Morning Yoga Flow',
      instructor: 'Emma Wilson',
      duration: '20 min',
      difficulty: 'Beginner',
      calories: 120,
      thumbnail: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop',
      category: 'Yoga',
    },
    {
      title: 'Strength Training Basics',
      instructor: 'Mike Chen',
      duration: '45 min',
      difficulty: 'Intermediate',
      calories: 280,
      thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop',
      category: 'Strength',
    },
    {
      title: 'Cardio Dance Workout',
      instructor: 'Lisa Martinez',
      duration: '25 min',
      difficulty: 'Beginner',
      calories: 200,
      thumbnail: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=250&fit=crop',
      category: 'Cardio',
    },
    {
      title: 'Core Pilates Session',
      instructor: 'Anna Lee',
      duration: '30 min',
      difficulty: 'Intermediate',
      calories: 180,
      thumbnail: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=400&h=250&fit=crop',
      category: 'Pilates',
    },
    {
      title: 'Evening Stretch & Relax',
      instructor: 'David Park',
      duration: '15 min',
      difficulty: 'Beginner',
      calories: 80,
      thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=250&fit=crop',
      category: 'Yoga',
    },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'text-green-600';
      case 'Intermediate':
        return 'text-yellow-600';
      case 'Advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Exercise Videos</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Categories */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                index === 0
                  ? 'bg-purple-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Video */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="relative h-48">
            <img
              src={videos[0].thumbnail}
              alt={videos[0].title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute top-4 left-4">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full">
                Featured
              </span>
            </div>
            <button className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-full">
                <Play className="w-8 h-8 text-purple-500" />
              </div>
            </button>
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <h3 className="text-white mb-2">{videos[0].title}</h3>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {videos[0].duration}
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {videos[0].calories} cal
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Video List */}
        <h2 className="mb-4 text-gray-900">All Workouts</h2>
        <div className="space-y-3">
          {videos.slice(1).map((video, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm flex">
              <div className="relative w-32 h-24 flex-shrink-0">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full">
                    <Play className="w-5 h-5 text-purple-500" />
                  </div>
                </div>
              </div>
              <div className="flex-1 p-4">
                <h3 className="text-gray-900 mb-1">{video.title}</h3>
                <p className="text-gray-500 mb-2">{video.instructor}</p>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-600">{video.duration}</span>
                  <span className={getDifficultyColor(video.difficulty)}>
                    {video.difficulty}
                  </span>
                  <span className="text-orange-600">{video.calories} cal</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
