import { useCategoriesContext } from '../lib/CategoriesContext'

export default function CategoryFilter({ selectedCategories, onCategoryToggle }) {
  const { categories } = useCategoriesContext()
  return (
    <div className="fixed top-20 left-4 right-4 z-40 bg-gray-800 rounded-lg p-3 shadow-lg">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => onCategoryToggle(category.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
              selectedCategories.includes(category.id)
                ? 'bg-opacity-100 text-white'
                : 'bg-opacity-30 text-gray-300 hover:bg-opacity-50'
            }`}
            style={{
              backgroundColor: selectedCategories.includes(category.id) 
                ? category.color 
                : category.color + '4D'
            }}
          >
            <span className="mr-1">{category.emoji}</span>
            {category.label}
          </button>
        ))}
      </div>
    </div>
  )
}
