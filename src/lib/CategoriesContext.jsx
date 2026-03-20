import { createContext, useContext } from 'react'
import { useCategories } from '../hooks/useCategories'

const CategoriesContext = createContext()

export function useCategoriesContext() {
  const context = useContext(CategoriesContext)
  if (!context) {
    throw new Error('useCategoriesContext must be used within CategoriesProvider')
  }
  return context
}

export function CategoriesProvider({ children }) {
  const categoriesData = useCategories()

  return (
    <CategoriesContext.Provider value={categoriesData}>
      {children}
    </CategoriesContext.Provider>
  )
}
