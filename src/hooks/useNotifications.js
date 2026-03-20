import { useMemo } from 'react'

/**
 * Compute notifications from spots data.
 * Shows reactions and visits on the current user's spots.
 * Pure computation — no extra Firestore calls.
 */
export function useNotifications(uid, spots = []) {
  return useMemo(() => {
    if (!uid) return { notifications: [], unreadCount: 0 }

    const notifications = []
    const mySpots = spots.filter(s => s.createdBy === uid)

    for (const spot of mySpots) {
      // Reactions on my spots (from other users)
      const reactions = spot.reactions || {}
      for (const [emoji, users] of Object.entries(reactions)) {
        if (!Array.isArray(users)) continue
        for (const reactorUid of users) {
          if (reactorUid === uid) continue // skip own reactions
          notifications.push({
            id: `reaction-${spot.id}-${emoji}-${reactorUid}`,
            type: 'reaction',
            emoji,
            spotId: spot.id,
            spotTitle: spot.title,
            fromUid: reactorUid,
          })
        }
      }

      // Visits on my spots (from other users)
      for (const v of (spot.visitors || [])) {
        if (v.uid === uid) continue
        notifications.push({
          id: `visit-${spot.id}-${v.uid}`,
          type: 'visit',
          spotId: spot.id,
          spotTitle: spot.title,
          fromUid: v.uid,
          fromName: v.name || v.email?.split('@')[0] || 'Jemand',
          fromPhoto: v.photo || '',
          timestamp: v.visitedAt,
        })
      }

      // Photos added by others on my spots
      if (spot.photoMeta) {
        for (const meta of spot.photoMeta) {
          if (meta.uploadedBy === uid || !meta.uploadedBy) continue
          notifications.push({
            id: `photo-${spot.id}-${meta.uploadedBy}-${meta.uploadedAt}`,
            type: 'photo',
            spotId: spot.id,
            spotTitle: spot.title,
            fromUid: meta.uploadedBy,
            fromName: meta.uploadedByName || 'Jemand',
            fromPhoto: meta.uploadedByPhoto || '',
            timestamp: meta.uploadedAt,
          })
        }
      }
    }

    // Enrich reaction notifications with names from visitor/creator data
    const userNames = {}
    for (const spot of spots) {
      if (spot.createdBy) {
        userNames[spot.createdBy] = {
          name: spot.createdByName || spot.createdByEmail?.split('@')[0] || '',
          photo: spot.createdByPhoto || '',
        }
      }
      for (const v of (spot.visitors || [])) {
        if (v.uid) {
          userNames[v.uid] = { name: v.name || v.email?.split('@')[0] || '', photo: v.photo || '' }
        }
      }
    }

    for (const n of notifications) {
      if (!n.fromName && userNames[n.fromUid]) {
        n.fromName = userNames[n.fromUid].name || 'Jemand'
        n.fromPhoto = userNames[n.fromUid].photo || ''
      }
      if (!n.fromName) n.fromName = 'Jemand'
    }

    // Sort: visits and photos by timestamp (newest first), reactions at end
    notifications.sort((a, b) => {
      if (a.timestamp && b.timestamp) return new Date(b.timestamp) - new Date(a.timestamp)
      if (a.timestamp) return -1
      if (b.timestamp) return 1
      return 0
    })

    return {
      notifications,
      unreadCount: notifications.length,
    }
  }, [uid, spots])
}
