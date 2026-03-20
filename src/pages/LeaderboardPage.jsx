import { useAuth } from '../lib/AuthContext'
import { useUserStats } from '../hooks/useUserStats'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { RANKS } from '../constants/gamification'

export default function LeaderboardPage({ spots = [] }) {
  const { user } = useAuth()
  const userStats = useUserStats(user?.uid, spots, [])
  const leaderboard = useLeaderboard(spots)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 overflow-y-auto" style={{ paddingTop: 'calc(3.5rem + env(safe-area-inset-top, 0px))', paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}>
      <div className="max-w-lg mx-auto px-4">
        {/* Header */}
        <div className="pt-5 pb-4">
          <h1 className="text-xl font-bold text-white">Rangliste</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leaderboard.length} Entdecker</p>
        </div>

        {/* Podium Top 3 */}
        {leaderboard.length >= 1 && (
          <div className="flex items-end justify-center gap-3 pt-2 pb-4">
            {/* 2nd place */}
            {leaderboard[1] && (
              <div className="flex flex-col items-center w-24">
                <div className="text-2xl mb-1">🥈</div>
                {leaderboard[1].photo ? (
                  <img src={leaderboard[1].photo} alt="" className="w-12 h-12 rounded-full ring-2 ring-gray-400/30" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold">
                    {(leaderboard[1].name?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <p className="text-white text-xs font-medium mt-1.5 truncate w-full text-center">{leaderboard[1].name}</p>
                <p className="text-gray-500 text-[10px]">{leaderboard[1].xp} XP</p>
              </div>
            )}
            {/* 1st place */}
            <div className="flex flex-col items-center w-28 -mt-4">
              <div className="text-3xl mb-1">🥇</div>
              {leaderboard[0].photo ? (
                <img src={leaderboard[0].photo} alt="" className="w-16 h-16 rounded-full ring-3 ring-amber-400/40" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
                  {(leaderboard[0].name?.[0] || '?').toUpperCase()}
                </div>
              )}
              <p className="text-white text-sm font-bold mt-1.5 truncate w-full text-center">{leaderboard[0].name}</p>
              <p className="text-amber-400 text-xs font-medium">{leaderboard[0].xp} XP</p>
            </div>
            {/* 3rd place */}
            {leaderboard[2] && (
              <div className="flex flex-col items-center w-24">
                <div className="text-2xl mb-1">🥉</div>
                {leaderboard[2].photo ? (
                  <img src={leaderboard[2].photo} alt="" className="w-12 h-12 rounded-full ring-2 ring-orange-400/30" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold">
                    {(leaderboard[2].name?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <p className="text-white text-xs font-medium mt-1.5 truncate w-full text-center">{leaderboard[2].name}</p>
                <p className="text-gray-500 text-[10px]">{leaderboard[2].xp} XP</p>
              </div>
            )}
          </div>
        )}

        {/* Full List */}
        <div className="bg-white/[0.03] rounded-2xl border border-white/[0.04] overflow-hidden">
          {leaderboard.map((entry, index) => {
            const isMe = entry.uid === user?.uid
            return (
              <div
                key={entry.uid}
                className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                  isMe ? 'bg-violet-500/[0.08]' : index % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
                } ${index > 0 ? 'border-t border-white/[0.04]' : ''}`}
              >
                <span className={`w-6 text-center text-sm font-bold ${
                  index === 0 ? 'text-amber-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-600'
                }`}>
                  {index + 1}
                </span>
                {entry.photo ? (
                  <img src={entry.photo} alt="" className="w-9 h-9 rounded-full ring-1 ring-white/[0.06]" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-sm font-bold">
                    {(entry.name?.[0] || '?').toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-violet-300' : 'text-white'}`}>
                      {entry.name}{isMe ? ' (Du)' : ''}
                    </p>
                    <span className="text-xs">{entry.rank.emoji}</span>
                  </div>
                  <p className="text-[11px] text-gray-500">{entry.rank.title} · {entry.spotsCreated} Spots</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${isMe ? 'text-violet-300' : 'text-white'}`}>{entry.xp}</p>
                  <p className="text-[10px] text-gray-600">XP</p>
                </div>
              </div>
            )
          })}
          {leaderboard.length === 0 && (
            <p className="text-gray-600 text-sm text-center py-8">Noch keine Daten</p>
          )}
        </div>

        {/* XP Legend */}
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04] mt-4">
          <h3 className="text-white font-semibold text-sm mb-3">So verdienst du XP</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-400">Spot erstellen</span><span className="text-violet-300 font-medium">+10 XP</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Foto hochladen</span><span className="text-violet-300 font-medium">+5 XP</span></div>
            <div className="flex justify-between"><span className="text-gray-400">"Ich war hier"</span><span className="text-violet-300 font-medium">+5 XP</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Kommentar</span><span className="text-violet-300 font-medium">+3 XP</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Reaktion</span><span className="text-violet-300 font-medium">+1 XP</span></div>
          </div>
        </div>

        {/* Rank Legend */}
        <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/[0.04] mt-3">
          <h3 className="text-white font-semibold text-sm mb-3">Ränge</h3>
          <div className="space-y-2">
            {RANKS.map((r) => (
              <div key={r.title} className={`flex items-center gap-2.5 text-sm ${
                userStats?.rank?.title === r.title ? 'text-violet-300 font-medium' : 'text-gray-500'
              }`}>
                <span className="text-lg w-7 text-center">{r.emoji}</span>
                <span className="flex-1">{r.title}</span>
                <span className="text-xs">{r.minXP}+ XP</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
