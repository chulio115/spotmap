import { useMemo } from 'react'
import { XP_VALUES, getRankForXP } from '../constants/gamification'

/**
 * Compute leaderboard from spots data.
 * Returns sorted array of user stats with XP and rank.
 */
export function useLeaderboard(spots = []) {
  return useMemo(() => {
    const userMap = {}

    const getOrCreate = (uid, name, email, photo) => {
      if (!userMap[uid]) {
        userMap[uid] = {
          uid,
          name: name || email?.split('@')[0] || 'Unbekannt',
          email: email || '',
          photo: photo || '',
          spotsCreated: 0,
          photosUploaded: 0,
          spotsVisited: 0,
          reactionsGiven: 0,
          reactionsReceived: 0,
        }
      }
      // Update name/photo if we get better data
      if (name && !userMap[uid].name) userMap[uid].name = name
      if (photo && !userMap[uid].photo) userMap[uid].photo = photo
      return userMap[uid]
    }

    for (const spot of spots) {
      // Count spots created
      if (spot.createdBy) {
        const u = getOrCreate(spot.createdBy, spot.createdByName, spot.createdByEmail, spot.createdByPhoto)
        u.spotsCreated++

        // Count photos on own spots (fallback if no photoMeta)
        if (spot.photoMeta?.length > 0) {
          for (const meta of spot.photoMeta) {
            if (meta.uploadedBy) {
              const uploader = getOrCreate(meta.uploadedBy, meta.uploadedByName, '', meta.uploadedByPhoto)
              uploader.photosUploaded++
            }
          }
        } else {
          u.photosUploaded += (spot.photos?.length || 0)
        }

        // Count reactions received by spot creator
        const reactions = spot.reactions || {}
        let totalOnSpot = 0
        for (const users of Object.values(reactions)) {
          if (Array.isArray(users)) totalOnSpot += users.length
        }
        u.reactionsReceived += totalOnSpot
      }

      // Count visitors
      for (const v of (spot.visitors || [])) {
        if (v.uid) {
          const u = getOrCreate(v.uid, v.name, v.email, v.photo)
          u.spotsVisited++
        }
      }

      // Count reactions given
      const reactions = spot.reactions || {}
      for (const users of Object.values(reactions)) {
        if (Array.isArray(users)) {
          for (const uid of users) {
            const u = getOrCreate(uid, '', '', '')
            u.reactionsGiven++
          }
        }
      }
    }

    // Compute XP for each user
    const leaderboard = Object.values(userMap).map(u => {
      const xp =
        u.spotsCreated * XP_VALUES.SPOT_CREATED +
        u.photosUploaded * XP_VALUES.PHOTO_UPLOADED +
        u.spotsVisited * XP_VALUES.SPOT_VISITED +
        u.reactionsGiven * XP_VALUES.REACTION_GIVEN

      const rank = getRankForXP(xp)

      return { ...u, xp, rank }
    })

    // Sort by XP descending
    leaderboard.sort((a, b) => b.xp - a.xp)

    return leaderboard
  }, [spots])
}
