import { ArrowLeft, Search, Clock, Users, Heart } from 'lucide-react';

interface RecipesProps {
  onBack: () => void;
}

export function Recipes({ onBack }: RecipesProps) {
  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Dessert'];
  
  const recipes = [
    {
      name: 'Avocado Toast',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=300&fit=crop',
      time: '10 min',
      servings: 2,
      calories: 320,
      category: 'Breakfast',
      liked: true,
    },
    {
      name: 'Grilled Salmon Bowl',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop',
      time: '25 min',
      servings: 2,
      calories: 520,
      category: 'Lunch',
      liked: false,
    },
    {
      name: 'Quinoa Salad',
      image: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=400&h=300&fit=crop',
      time: '15 min',
      servings: 4,
      calories: 280,
      category: 'Lunch',
      liked: true,
    },
    {
      name: 'Berry Smoothie Bowl',
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
      time: '5 min',
      servings: 1,
      calories: 240,
      category: 'Breakfast',
      liked: false,
    },
    {
      name: 'Chicken Stir Fry',
      image: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&h=300&fit=crop',
      time: '20 min',
      servings: 3,
      calories: 380,
      category: 'Dinner',
      liked: true,
    },
    {
      name: 'Greek Yogurt Parfait',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
      time: '5 min',
      servings: 1,
      calories: 180,
      category: 'Snacks',
      liked: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-4 p-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-gray-900">Healthy Recipes</h1>
        </div>
      </div>

      <div className="p-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                index === 0
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Recipe Grid */}
        <div className="grid grid-cols-2 gap-4">
          {recipes.map((recipe, index) => (
            <div key={index} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative h-32">
                <img
                  src={recipe.image}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
                <button className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-full">
                  <Heart
                    className={`w-4 h-4 ${
                      recipe.liked ? 'fill-rose-500 text-rose-500' : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>
              <div className="p-3">
                <h3 className="text-gray-900 mb-2">{recipe.name}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{recipe.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{recipe.servings}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-green-600">{recipe.calories} cal</span>
                  <button className="text-green-500 hover:text-green-600">
                    View
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
