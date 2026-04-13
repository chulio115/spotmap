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
        visitors: [],
        createdBy: user.uid,
        createdByEmail: user.email,
        createdByName: user.displayName || '',
        createdByPhoto: user.photoURL || '',
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
        visitors: [],
        createdBy: user.uid,
        createdByEmail: user.email,
        createdByName: user.displayName || '',
        createdByPhoto: user.photoURL || '',
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

  const addVisitor = async (spotId, user) => {
    try {
      const spot = spots.find(s => s.id === spotId)
      const visitors = spot?.visitors || []
      if (visitors.some(v => v.uid === user.uid)) return // already visited

      const newVisitor = {
        uid: user.uid,
        name: user.displayName || '',
        email: user.email,
        photo: user.photoURL || '',
        visitedAt: new Date().toISOString()
      }
      const updatedVisitors = [...visitors, newVisitor]
      const spotRef = doc(db, 'spots', spotId)
      await updateDoc(spotRef, { visitors: updatedVisitors })
      setSpots(prev => prev.map(s =>
        s.id === spotId ? { ...s, visitors: updatedVisitors } : s
      ))
    } catch (err) {
      console.error('Error adding visitor:', err)
      throw err
    }
  }

  const removeVisitor = async (spotId, uid) => {
    try {
      const spot = spots.find(s => s.id === spotId)
      const updatedVisitors = (spot?.visitors || []).filter(v => v.uid !== uid)
      const spotRef = doc(db, 'spots', spotId)
      await updateDoc(spotRef, { visitors: updatedVisitors })
      setSpots(prev => prev.map(s =>
        s.id === spotId ? { ...s, visitors: updatedVisitors } : s
      ))
    } catch (err) {
      console.error('Error removing visitor:', err)
      throw err
    }
  }

  const toggleReaction = async (spotId, emoji, uid) => {
    try {
      const spot = spots.find(s => s.id === spotId)
      const reactions = { ...(spot?.reactions || {}) }
      const users = reactions[emoji] || []
      
      if (users.includes(uid)) {
        reactions[emoji] = users.filter(u => u !== uid)
        if (reactions[emoji].length === 0) delete reactions[emoji]
      } else {
        reactions[emoji] = [...users, uid]
      }

      const spotRef = doc(db, 'spots', spotId)
      await updateDoc(spotRef, { reactions })
      setSpots(prev => prev.map(s =>
        s.id === spotId ? { ...s, reactions } : s
      ))
    } catch (err) {
      console.error('Error toggling reaction:', err)
      throw err
    }
  }

  const addPhotosToSpot = async (spotId, newPhotoUrls, user) => {
    try {
      const spot = spots.find(s => s.id === spotId)
      const updatedPhotos = [...(spot?.photos || []), ...newPhotoUrls]
      const existingMeta = spot?.photoMeta || []
      const newMeta = newPhotoUrls.map(() => ({
        uploadedBy: user?.uid || '',
        uploadedByName: user?.displayName || user?.email?.split('@')[0] || '',
        uploadedByPhoto: user?.photoURL || '',
        uploadedAt: new Date().toISOString(),
      }))
      const updatedPhotoMeta = [...existingMeta, ...newMeta]

      const spotRef = doc(db, 'spots', spotId)
      await updateDoc(spotRef, { photos: updatedPhotos, photoMeta: updatedPhotoMeta })
      setSpots(prev => prev.map(s =>
        s.id === spotId ? { ...s, photos: updatedPhotos, photoMeta: updatedPhotoMeta } : s
      ))
    } catch (err) {
      console.error('Error adding photos:', err)
      throw err
    }
  }

  const deletePhotoFromSpot = async (spotId, photoIndex) => {
    try {
      const spot = spots.find(s => s.id === spotId)
      if (!spot) throw new Error('Spot not found')

      const updatedPhotos = (spot.photos || []).filter((_, i) => i !== photoIndex)
      const updatedPhotoMeta = (spot.photoMeta || []).filter((_, i) => i !== photoIndex)

      const spotRef = doc(db, 'spots', spotId)
      await updateDoc(spotRef, { photos: updatedPhotos, photoMeta: updatedPhotoMeta })
      setSpots(prev => prev.map(s =>
        s.id === spotId ? { ...s, photos: updatedPhotos, photoMeta: updatedPhotoMeta } : s
      ))
    } catch (err) {
      console.error('Error deleting photo:', err)
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
    addVisitor,
    removeVisitor,
    toggleReaction,
    addPhotosToSpot,
    deletePhotoFromSpot,
    refreshSpots: fetchSpots
  }
}
