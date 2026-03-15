import { useState, useEffect } from 'react'
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

// Mock Daten für Phase 1
const mockSpots = [
  {
    id: '1',
    title: 'Berliner Mauer Ost',
    description: 'Historische Stätte mit beeindruckenden Graffiti-Kunstwerken. Ein Muss für jeden Urban Explorer.',
    category: 'art',
    lat: 52.5163,
    lng: 13.3777,
    created_by: 'demo@user.de',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Secret Rooftop Party',
    description: 'Tolle Aussicht über die Stadt bei Sonnenuntergang. Nur für Eingeweihte!',
    category: 'party',
    lat: 52.5200,
    lng: 13.4050,
    created_by: 'user1@example.com',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: '3',
    title: 'Lost Place Fabrik',
    description: 'Verlassene Industrieanlage aus den 70er Jahren. Vorsicht bei der Erkundung!',
    category: 'lostplace',
    lat: 52.4900,
    lng: 13.4500,
    created_by: 'demo@user.de',
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: '4',
    title: 'Geheimer Frühstücksspot',
    description: 'Café mit bestem Croissant und tollem Garten. Nur Locals kennen es.',
    category: 'breakfast',
    lat: 52.4800,
    lng: 13.4300,
    created_by: 'user2@example.com',
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: '5',
    title: 'Aussichtspunkt Teufelsberg',
    description: '360° Blick über Berlin. Besonders bei Nacht magisch.',
    category: 'viewpoint',
    lat: 52.4964,
    lng: 13.2056,
    created_by: 'demo@user.de',
    created_at: new Date(Date.now() - 345600000).toISOString()
  }
]

export function useSpots() {
  const [spots, setSpots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchSpots = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const q = query(collection(db, 'spots'), orderBy('createdAt', 'desc'))
        const snapshot = await getDocs(q)
        const spotsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        
        setSpots(spotsData)
      } catch (err) {
        console.error('Error fetching spots:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSpots()
  }, [])

  const createSpot = async (spotData, user) => {
    try {
      const docRef = await addDoc(collection(db, 'spots'), {
        ...spotData,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp()
      })
      
      const newSpot = {
        id: docRef.id,
        ...spotData,
        createdBy: user.uid,
        createdByEmail: user.email,
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

  const getSpotById = (spotId) => {
    return spots.find(spot => spot.id === spotId)
  }

  const getSpotsByCategory = (categoryId) => {
    return spots.filter(spot => spot.category === categoryId)
  }

  const getSpotsByUser = (userEmail) => {
    return spots.filter(spot => spot.created_by === userEmail)
  }

  const getRecentSpots = (limit = 10) => {
    return spots
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit)
  }

  const searchSpots = (query) => {
    const lowercaseQuery = query.toLowerCase()
    return spots.filter(spot => 
      spot.title.toLowerCase().includes(lowercaseQuery) ||
      spot.description?.toLowerCase().includes(lowercaseQuery)
    )
  }

  return {
    spots,
    loading,
    error,
    createSpot,
    updateSpot,
    deleteSpot,
    getSpotById,
    getSpotsByCategory,
    getSpotsByUser,
    getRecentSpots,
    searchSpots,
    refreshSpots: () => {
      // Hier wird später die Supabase Logik implementiert
      setSpots(mockSpots)
    }
  }
}
