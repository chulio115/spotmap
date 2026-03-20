import { useMemo } from 'react'
import { XP_VALUES, ACHIEVEMENTS, getRankForXP, getNextRank } from '../constants/gamification'

/**
 * Calculate user stats, XP, rank, and achievements from spots + comments data.
 * Pure computation — no Firestore calls needed.
 */
export function useUserStats(uid, spots = [], allComments = []) {
  return useMemo(() => {
    if (!uid) return null

    // Spots created by this user
    const mySpots = spots.filter(s => s.createdBy === uid)

    // Photos uploaded by this user (count photo metadata entries)
    const photosUploaded = spots.reduce((count, spot) => {
      const photoMeta = spot.photoMeta || []
      return count + photoMeta.filter(p => p.uploadedBy === uid).length
    }, 0)
    // Fallback: count photos on own spots if no photoMeta exists
    const photosOnOwnSpots = mySpots.reduce((count, s) => count + (s.photos?.length || 0), 0)
    const totalPhotos = photosUploaded > 0 ? photosUploaded : photosOnOwnSpots

    // Spots visited by this user
    const spotsVisited = spots.filter(s =>
      (s.visitors || []).some(v => v.uid === uid)
    ).length

    // Comments written by this user
    const commentsWritten = allComments.filter(c => c.authorUid === uid).length

    // Reactions given by this user
    const reactionsGiven = spots.reduce((count, spot) => {
      const reactions = spot.reactions || {}
      return count + Object.values(reactions).reduce((sum, users) => {
        return sum + (Array.isArray(users) && users.includes(uid) ? 1 : 0)
      }, 0)
    }, 0)

    // Reactions received on own spots
    const totalReactionsReceived = mySpots.reduce((count, spot) => {
      const reactions = spot.reactions || {}
      return count + Object.values(reactions).reduce((sum, users) => {
        return sum + (Array.isArray(users) ? users.length : 0)
      }, 0)
    }, 0)

    // Max visitors on any of user's spots
    const maxVisitorsOnSpot = mySpots.reduce((max, s) =>
      Math.max(max, (s.visitors || []).length), 0
    )

    // Unique categories used
    const uniqueCategories = new Set(mySpots.map(s => s.category)).size

    // Early bird / night owl checks
    const hasEarlySpot = mySpots.some(s => {
      const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt)
      return d.getHours() < 7
    })
    const hasNightSpot = mySpots.some(s => {
      const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt)
      return d.getHours() >= 0 && d.getHours() < 4
    })

    // Calculate XP
    const xp =
      mySpots.length * XP_VALUES.SPOT_CREATED +
      totalPhotos * XP_VALUES.PHOTO_UPLOADED +
      commentsWritten * XP_VALUES.COMMENT_WRITTEN +
      spotsVisited * XP_VALUES.SPOT_VISITED +
      reactionsGiven * XP_VALUES.REACTION_GIVEN

    const rank = getRankForXP(xp)
    const nextRank = getNextRank(xp)

    // Stats object for achievement checks
    const stats = {
      spotsCreated: mySpots.length,
      photosUploaded: totalPhotos,
      spotsVisited,
      commentsWritten,
      reactionsGiven,
      totalReactionsReceived,
      maxVisitorsOnSpot,
      uniqueCategories,
      hasEarlySpot,
      hasNightSpot,
    }

    // Check achievements
    const unlockedAchievements = ACHIEVEMENTS.filter(a => a.check(stats))
    const lockedAchievements = ACHIEVEMENTS.filter(a => !a.check(stats))

    return {
      xp,
      rank,
      nextRank,
      stats,
      unlockedAchievements,
      lockedAchievements,
      allAchievements: ACHIEVEMENTS,
    }
  }, [uid, spots, allComments])
}
