import { useState, useEffect } from 'react'
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { CATEGORIES as DEFAULT_CATEGORIES } from '../constants/categories'

// Predefined color palette for new categories
export const CATEGORY_COLORS = [
  '#F59E0B', '#8B5CF6', '#6B7280', '#10B981', '#F97316',
  '#EF4444', '#3B82F6', '#EC4899', '#14B8A6', '#0891B2',
  '#DC2626', '#64748B', '#D946EF', '#84CC16', '#F43F5E',
  '#06B6D4', '#A855F7', '#22C55E', '#E11D48', '#0EA5E9',
]

// Common emoji options for categories
export const CATEGORY_EMOJIS = [
  '☕', '🎉', '🏚️', '🌿', '🌅', '🍜', '🍺', '🎨', '🛹', '🎣',
  '🔞', '📍', '🏖️', '⛺', '🏔️', '🎵', '🎭', '🏋️', '🛶', '🚴',
  '📸', '🧘', '🎮', '🍕', '☕', '🍸', '🏄', '⛷️', '🎪', '🌊',
  '🏕️', '🗿', '💎', '🔥', '🌈', '🎯', '🏰', '⛪', '🌳', '🦋',
]

export function useCategories() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'))
        if (snapshot.empty) {
          // Seed Firestore with default categories on first load
          const batch = DEFAULT_CATEGORIES.map(cat =>
            setDoc(doc(db, 'categories', cat.id), cat)
          )
          await Promise.all(batch)
          setCategories(DEFAULT_CATEGORIES)
        } else {
          const firestoreCategories = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
          setCategories(firestoreCategories)
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
        // Fallback to defaults
        setCategories(DEFAULT_CATEGORIES)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const addCategory = async (category) => {
    try {
      await setDoc(doc(db, 'categories', category.id), category)
      setCategories(prev => [...prev, category])
      return { success: true }
    } catch (err) {
      console.error('Error adding category:', err)
      throw err
    }
  }

  const removeCategory = async (categoryId) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId))
      setCategories(prev => prev.filter(c => c.id !== categoryId))
      return { success: true }
    } catch (err) {
      console.error('Error removing category:', err)
      throw err
    }
  }

  const getCategoryById = (id) => {
    return categories.find(cat => cat.id === id)
  }

  const getCategoryColor = (id) => {
    const category = getCategoryById(id)
    return category ? category.color : '#64748B'
  }

  return { categories, loading, addCategory, removeCategory, getCategoryById, getCategoryColor }
}
