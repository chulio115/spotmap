// XP values for different actions
export const XP_VALUES = {
  SPOT_CREATED: 10,
  PHOTO_UPLOADED: 5,
  COMMENT_WRITTEN: 3,
  SPOT_VISITED: 5,
  REACTION_GIVEN: 1,
}

// Rank tiers based on XP
export const RANKS = [
  { minXP: 0, title: 'Frischling', emoji: '🐣' },
  { minXP: 21, title: 'Spaziergänger', emoji: '🚶' },
  { minXP: 51, title: 'Entdecker', emoji: '🧭' },
  { minXP: 101, title: 'Kartograph', emoji: '🗺️' },
  { minXP: 201, title: 'Abenteurer', emoji: '🏔️' },
  { minXP: 501, title: 'Spot-Legende', emoji: '👑' },
  { minXP: 1000, title: 'Unsterblich', emoji: '🌟' },
]

export function getRankForXP(xp) {
  let rank = RANKS[0]
  for (const r of RANKS) {
    if (xp >= r.minXP) rank = r
  }
  return rank
}

export function getNextRank(xp) {
  for (const r of RANKS) {
    if (xp < r.minXP) return r
  }
  return null // max rank reached
}

// Available emoji reactions
export const REACTIONS = ['🔥', '❤️', '😍', '🤙', '👀']

// Achievement definitions
export const ACHIEVEMENTS = [
  {
    id: 'first_spot',
    name: 'Pfadfinder',
    emoji: '🗺️',
    description: 'Erstelle deinen ersten Spot',
    check: (stats) => stats.spotsCreated >= 1,
  },
  {
    id: 'photographer',
    name: 'Paparazzi',
    emoji: '📸',
    description: '10 Fotos hochgeladen',
    check: (stats) => stats.photosUploaded >= 10,
  },
  {
    id: 'explorer',
    name: 'Weltenbummler',
    emoji: '🏃',
    description: '10 verschiedene Spots besucht',
    check: (stats) => stats.spotsVisited >= 10,
  },
  {
    id: 'chatterbox',
    name: 'Quasselstrippe',
    emoji: '💬',
    description: '20 Kommentare geschrieben',
    check: (stats) => stats.commentsWritten >= 20,
  },
  {
    id: 'early_bird',
    name: 'Früher Vogel',
    emoji: '🌅',
    description: 'Spot vor 7 Uhr morgens erstellt',
    check: (stats) => stats.hasEarlySpot,
  },
  {
    id: 'night_owl',
    name: 'Nachteule',
    emoji: '🦉',
    description: 'Spot nach Mitternacht erstellt',
    check: (stats) => stats.hasNightSpot,
  },
  {
    id: 'spot_king',
    name: 'Spot-König',
    emoji: '🏆',
    description: '25 Spots erstellt',
    check: (stats) => stats.spotsCreated >= 25,
  },
  {
    id: 'influencer',
    name: 'Influencer',
    emoji: '👥',
    description: 'Einen Spot mit 5+ Besuchern',
    check: (stats) => stats.maxVisitorsOnSpot >= 5,
  },
  {
    id: 'collector',
    name: 'Sammler',
    emoji: '🗃️',
    description: 'Spots in 5+ verschiedenen Kategorien',
    check: (stats) => stats.uniqueCategories >= 5,
  },
  {
    id: 'fire_starter',
    name: 'Trendsetter',
    emoji: '🔥',
    description: '50 Reaktionen auf eigene Spots erhalten',
    check: (stats) => stats.totalReactionsReceived >= 50,
  },
]
