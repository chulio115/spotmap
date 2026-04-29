import { Link } from 'react-router-dom'
import { MapPin, Users, Trophy, Lock, ArrowRight, Sparkles, Shield, Camera } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-fuchsia-600/10 rounded-full blur-[150px]" />
      <div className="absolute top-[40%] left-[30%] w-[300px] h-[300px] bg-cyan-500/5 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <div className="mx-auto h-24 w-24 rounded-3xl overflow-hidden shadow-2xl shadow-violet-500/30 rotate-3 mb-6">
            <img src="/logo.svg" alt="SpotMap" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-4">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
              SpotMap
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Geheime Spots teilen.<br />
            <span className="text-violet-400">Nur für deinen Circle.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/login"
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 flex items-center justify-center gap-2 text-lg"
            >
              Jetzt starten
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <FeatureCard
            icon={<MapPin className="w-6 h-6" />}
            title="Geheime Spots"
            description="Markiere und teile deine Lieblingsorte mit deinem Circle - nur eingeladene Mitglieder haben Zugang."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Dein Circle"
            description="Lade Freunde ein und bildet einen exklusiven Circle für gemeinsame Abenteuer."
          />
          <FeatureCard
            icon={<Camera className="w-6 h-6" />}
            title="Foto-Galerie"
            description="Teile Fotos von deinen Spots und sehe, was dein Circle entdeckt hat."
          />
          <FeatureCard
            icon={<Trophy className="w-6 h-6" />}
            title="Gamification"
            description="Sammle XP, erreiche Ränge und schalte Achievements frei für jede Aktivität."
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="Privat & Sicher"
            description="Nur eingeladene Mitglieder haben Zugang - deine Spots bleiben geheim."
          />
          <FeatureCard
            icon={<Sparkles className="w-6 h-6" />}
            title="Social Features"
            description="Reagiere mit Emojis, kommentiere und verfolge Aktivitäten in deinem Circle."
          />
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-violet-600/10 to-fuchsia-600/10 rounded-3xl p-8 md:p-12 border border-white/[0.06] backdrop-blur-sm text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bereit, deine Spots zu teilen?</h2>
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Schließe dich deinem Circle an und entdecke geheime Orte, die nur du und deine Freunde kennen.
          </p>
          <Link
            to="/login"
            className="inline-flex px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-semibold rounded-2xl hover:from-violet-500 hover:to-fuchsia-500 transition-all shadow-lg shadow-violet-500/25 items-center gap-2 text-lg"
          >
            Jetzt beitreten
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-gray-600 text-sm">
          <p>SpotMap © 2026 · Nur für deinen Circle</p>
        </div>
      </div>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-white/[0.03] backdrop-blur-sm rounded-2xl p-6 border border-white/[0.06] hover:bg-white/[0.05] transition-all group">
      <div className="w-12 h-12 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
        <div className="text-violet-400">{icon}</div>
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  )
}
