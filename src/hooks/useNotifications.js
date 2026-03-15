import { useState, useEffect, useMemo } from 'react'

export function useNotifications(currentUser) {
  const [notificationCount, setNotificationCount] = useState(0)
  const [newSpots, setNewSpots] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Mock neue Spots für Demo
  const mockNewSpots = useMemo(() => [
    {
      id: 'new1',
      title: 'Secret Garden Bar',
      category: 'bar',
      created_by: 'user3@example.com',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'new2', 
      title: 'Lost Place Warehouse',
      category: 'lostplace',
      created_by: 'user1@example.com',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'new3',
      title: 'Sunset Viewpoint',
      category: 'viewpoint',
      created_by: 'user2@example.com',
      created_at: new Date(Date.now() - 10800000).toISOString()
    }
  ], [])

  // Lade neue Spots wenn User eingeloggt ist
  useEffect(() => {
    if (!currentUser) {
      setNotificationCount(0)
      setNewSpots([])
      return
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true)
        setError(null)

        // Hier wird später die Supabase Logik implementiert
        // const { data, error } = await supabase.rpc('get_new_spots_count', {
        //   p_user_id: currentUser.id
        // })

        // Mock Simulation
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Simuliere neue Spots seit letztem Besuch
        const lastSeen = localStorage.getItem(`last_seen_${currentUser.id}`)
        const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(Date.now() - 24 * 60 * 60 * 1000)
        
        const filteredNewSpots = mockNewSpots.filter(spot => 
          new Date(spot.created_at) > lastSeenDate
        )
        
        setNewSpots(filteredNewSpots)
        setNotificationCount(filteredNewSpots.length)

      } catch (err) {
        console.error('Fehler beim Laden der Notifications:', err)
        setError('Notifications konnten nicht geladen werden')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [currentUser, mockNewSpots])

  // Markiere Notifications als gelesen
  const markAsRead = async () => {
    if (!currentUser) return

    try {
      // Hier wird später die Supabase Logik implementiert
      // const { error } = await supabase
      //   .from('user_last_seen')
      //   .upsert({ 
      //     user_id: currentUser.id, 
      //     last_seen: new Date().toISOString() 
      //   })

      // Mock Implementation
      localStorage.setItem(`last_seen_${currentUser.id}`, new Date().toISOString())
      
      setNotificationCount(0)
      setNewSpots([])

    } catch (err) {
      console.error('Fehler beim Markieren als gelesen:', err)
      throw new Error('Status konnte nicht aktualisiert werden')
    }
  }

  // Hole den letzten Besuch eines Users
  const getLastSeen = async (userId) => {
    try {
      // Hier wird später die Supabase Logik implementiert
      // const { data, error } = await supabase
      //   .from('user_last_seen')
      //   .select('last_seen')
      //   .eq('user_id', userId)
      //   .single()

      // Mock Implementation
      const lastSeen = localStorage.getItem(`last_seen_${userId}`)
      return lastSeen ? new Date(lastSeen) : new Date(Date.now() - 24 * 60 * 60 * 1000)

    } catch (err) {
      console.error('Fehler beim Laden des letzten Besuchs:', err)
      return new Date(Date.now() - 24 * 60 * 60 * 1000) // Default: 24h ago
    }
  }

  // Setze manuell einen neuen Spot (wenn ein Spot erstellt wird)
  const addNewSpot = (spot) => {
    if (!currentUser) return

    // Wenn der Spot von einem anderen User erstellt wurde
    if (spot.created_by !== currentUser.email) {
      setNewSpots(prev => [spot, ...prev])
      setNotificationCount(prev => prev + 1)
    }
  }

  // Entferne einen Spot aus den Notifications
  const removeSpot = (spotId) => {
    setNewSpots(prev => prev.filter(spot => spot.id !== spotId))
    setNotificationCount(prev => Math.max(0, prev - 1))
  }

  // Prüfe ob ein Spot neu ist
  const isSpotNew = (spot) => {
    if (!currentUser) return false
    
    const lastSeen = localStorage.getItem(`last_seen_${currentUser.id}`)
    const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    return new Date(spot.created_at) > lastSeenDate
  }

  // Hole die Anzahl neuer Spots für einen User
  const getNewSpotsCount = async (userId) => {
    try {
      // Hier wird später die Supabase Logik implementiert
      // const { data, error } = await supabase.rpc('get_new_spots_count', {
      //   p_user_id: userId
      // })

      // Mock Implementation
      const lastSeen = localStorage.getItem(`last_seen_${userId}`)
      const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(Date.now() - 24 * 60 * 60 * 1000)
      
      const count = mockNewSpots.filter(spot => 
        new Date(spot.created_at) > lastSeenDate
      ).length
      
      return count

    } catch (err) {
      console.error('Fehler beim Zählen neuer Spots:', err)
      return 0
    }
  }

  // Refreshe die Notifications
  const refreshNotifications = () => {
    if (!currentUser) return
    
    // Triggere useEffect neu
    setNotificationCount(0)
    setNewSpots([])
    
    // useEffect wird automatisch neu ausgeführt
  }

  return {
    notificationCount,
    newSpots,
    loading,
    error,
    markAsRead,
    getLastSeen,
    addNewSpot,
    removeSpot,
    isSpotNew,
    getNewSpotsCount,
    refreshNotifications,
    clearError: () => setError(null)
  }
}
