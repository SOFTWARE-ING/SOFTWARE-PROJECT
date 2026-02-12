import React from "react"
import { Link } from "react-router-dom"
import { Sparkles, Cpu, FileText, ArrowRight } from "lucide-react"

export default function HomeScreen() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-white">

      {/* Background Glow Effects */}
      <div className="absolute -top-50 -left-50 h-125 w-125 rounded-full bg-indigo-600/30 blur-[120px]" />
      <div className="absolute -bottom-50 -right-50 h-125 w-125 rounded-full bg-purple-600/30 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">

        {/* Logo / Brand */}
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600/20 p-4 backdrop-blur-md">
            <Cpu size={40} className="text-indigo-400" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            Gen<span className="text-indigo-500">EX</span>-APP
          </h1>
        </div>

        {/* Hero Title */}
        <h2 className="max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Génération intelligente d’exercices
          <span className="block bg-linear-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            à partir de vos supports de cours
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mt-6 max-w-2xl text-slate-400 text-lg">
          Transformez automatiquement vos documents en exercices interactifs,
          QCM, textes à trous, traductions et bien plus grâce à l’IA.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col gap-4 sm:flex-row">

          <Link
            to="/register"
            className="group flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-semibold transition hover:bg-indigo-500"
          >
            Commencer maintenant
            <ArrowRight size={18} className="transition group-hover:translate-x-1" />
          </Link>

          <Link
            to="/login"
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-8 py-3 text-sm font-medium backdrop-blur-md transition hover:bg-slate-800"
          >
            Se connecter
          </Link>

        </div>

        {/* Features Section */}
        <div className="mt-20 grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-3">

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md transition hover:border-indigo-500/40">
            <Sparkles className="mb-4 text-indigo-400" size={28} />
            <h3 className="mb-2 text-lg font-semibold">
              Génération Automatique
            </h3>
            <p className="text-sm text-slate-400">
              L’IA analyse vos supports et crée des exercices structurés instantanément.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md transition hover:border-indigo-500/40">
            <FileText className="mb-4 text-purple-400" size={28} />
            <h3 className="mb-2 text-lg font-semibold">
              Export PDF Intelligent
            </h3>
            <p className="text-sm text-slate-400">
              Exportation propre et professionnelle prête pour l’impression ou le partage.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md transition hover:border-indigo-500/40">
            <Cpu className="mb-4 text-indigo-400" size={28} />
            <h3 className="mb-2 text-lg font-semibold">
              Moteur IA Avancé
            </h3>
            <p className="text-sm text-slate-400">
              Technologie intelligente optimisée pour enseignants et créateurs de contenu.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-20 text-xs text-slate-600">
          © {new Date().getFullYear()} GenEX-APP • Intelligent Exercise Generation System
        </div>

      </div>
    </div>
  )
}
