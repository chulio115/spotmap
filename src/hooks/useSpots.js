import { useState, useEffect, useCallback } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useSpots() {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSpots = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const q = query(collection(db, 'spots'), orderBy('createdAt', 'desc'))
      const snapshot = await getDocs(q)
      const spotsData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }))
      
      setSpots(spotsData)
    } catch (err) {
      console.error('Error fetching spots:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSpots()
  }, [fetchSpots])

  const createSpot = async (spotData, user) => {
    try {
      const docRef = await addDoc(collection(db, 'spots'), {
        title: spotData.title,
        description: spotData.description || '',
        category: spotData.category,
        lat: spotData.lat,
        lng: spotData.lng,
        photos: spotData.photos || [],
        createdBy: user.uid,
        createdByEmail: user.email,
        createdByName: user.displayName || '',
        createdAt: serverTimestamp()
      })
      
      const newSpot = {
        id: docRef.id,
        title: spotData.title,
        description: spotData.description || '',
        category: spotData.category,
        lat: spotData.lat,
        lng: spotData.lng,
        photos: spotData.photos || [],
        createdBy: user.uid,
        createdByEmail: user.email,
        createdByName: user.displayName || '',
        createdAt: new Date()
      }
      
      setSpots(prev => [newSpot, ...prev])
      return newSpot
    } catch (err) {
      console.error('Error creating spot:', err)
      setError(err.message)
      throw err
    }
  }

  const updateSpot = async (spotId, updates) => {
    try {
      const spotRef = doc(db, 'spots', spotId)
      await updateDoc(spotRef, updates)
      
      setSpots(prev => prev.map(spot => 
        spot.id === spotId ? { ...spot, ...updates } : spot
      ))
    } catch (err) {
      console.error('Error updating spot:', err)
      setError(err.message)
      throw err
    }
  }

  const deleteSpot = async (spotId) => {
    try {
      await deleteDoc(doc(db, 'spots', spotId))
      setSpots(prev => prev.filter(spot => spot.id !== spotId))
    } catch (err) {
      console.error('Error deleting spot:', err)
      setError(err.message)
      throw err
    }
  }

  return {
    spots,
    loading,
    error,
    createSpot,
    updateSpot,
    deleteSpot,
    refreshSpots: fetchSpots
  }
}
