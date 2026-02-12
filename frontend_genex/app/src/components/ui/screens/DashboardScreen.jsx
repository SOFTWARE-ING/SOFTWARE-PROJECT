import React from "react"
import { Folder, CheckCircle2, Languages, Clock, Sparkles } from "lucide-react"

/* ---------- DATA ---------- */
const stats = [
  {
    code: "documents",
    value: 24,
    icon: Folder,
    badge: "+2 semaines",
    label: "Documents créés",
  },
  {
    code: "exercices",
    value: 186,
    icon: CheckCircle2,
    badge: "+12%",
    label: "Exercices générés",
  },
  {
    code: "traductions",
    value: 8,
    icon: Languages,
    badge: null,
    label: "Traductions",
  },
  {
    code: "temps",
    value: "14h",
    icon: Clock,
    badge: "Estimé",
    label: "Temps gagné",
  },
]

/* ---------- COMPONENTS ---------- */
const StatCard = ({ icon: icon, value, badge, label }) => (
  <div className="flex-1 border border-slate-200 dark:border-slate-800 bg-white dark:shadow-slate-950 dark:bg-slate-900 p-6 dark:shadow-md transition hover:shadow-md">
    <div className="flex items-start justify-between mb-4">
      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
        {icon && React.createElement(icon, { size: 24, strokeWidth: 2 })}
      </div>

      {badge && (
        <span className="rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {badge}
        </span>
      )}
    </div>

    <div className="text-3xl font-bold tracking-tight">{value}</div>
    <p className="mt-1 text-sm tracking-widest font-thin text-slate-600 dark:text-slate-400">
      {label}
    </p>
  </div>
)

const ProjectRow = ({ name, type, date, status }) => {
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Terminé':
        return 'rounded-xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400';
      case 'En cours':
        return 'rounded-xl border border-amber-200 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-600 dark:text-amber-400';
      case 'Brouillon':
        return 'rounded-xl border border-slate-200 dark:border-slate-500/20 bg-slate-50 dark:bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400';
      default:
        return 'rounded-xl border border-slate-200 dark:border-slate-500/20 bg-slate-50 dark:bg-slate-500/10 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400';
    }
  };

  return (
    <tr className="border-b border-slate-200 dark:border-slate-800 last:border-none transition-all ease-in-out duration-300 ">
      <td className="py-3 pl-4 font-medium">{name}</td>
      <td className="py-3">{type}</td>
      <td className="py-3 text-slate-500">{date}</td>
      <td className="py-3">
        <span className={getStatusBadge(status)}>
          {status}
        </span>
      </td>
      <td className="py-3 pr-4 text-right">⋯</td>
    </tr>
  );
};

/* ---------- SCREEN ---------- */
export default function DashboardScreen() {
  return (
    <div className="flex flex-col h-screen w-screen bg-slate-50 px-4 py-3 text-slate-900 dark:bg-slate-950/30 dark:text-slate-100">

      {/* Title */}
      {/* <h1 className="mb-4 text-2xl font-bold">Tableau de bord</h1> */}

      {/* Stats */}
      <div className="mb-8 flex flex-wrap gap-4">
        {stats.map((item) => (
          <StatCard key={item.code} {...item} />
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1  gap-8 mb-8">

        {/* Recent projects */}
        <div className="lg:col-span-2 rounded-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold">Projets récents</h3>
            <button className="text-sm font-medium cursor-pointer text-indigo-600 hover:underline dark:text-indigo-400">
              View All
            </button>
          </div>

          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800 text-xs uppercase text-slate-500">
              <tr>
                <th className="pb-3 pl-4">Nom</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Statut</th>
                <th className="pb-3 pr-4 text-right"></th>
              </tr>
            </thead>
            <tbody>
              <ProjectRow name="Physique_Chap3.pdf" type="QCM" date="Il y a 2h" status="Terminé" />
              <ProjectRow name="Histoire_WW2.pdf" type="Traduction" date="Hier" status="En cours" />
              <ProjectRow name="Maths_Integrales.pdf" type="Texte à trous" date="20 Nov" status="Terminé" />
              <ProjectRow name="Bio_ADN.pdf" type="Schéma" date="18 Nov" status="Brouillon" />
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-6  grid grid-cols-1 md:grid-cols-2 gap-8  pb-8 ">

        {/* Quick Actions */}
        <div className="rounded-xs border-2 border-dashed border-indigo-400/60 dark:border-indigo-500/40 bg-white dark:bg-slate-900 p-6">
          <h3 className="mb-2 text-lg font-bold">Actions rapides</h3>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
            Démarrez une nouvelle tâche maintenant.
          </p>

          <div className="space-y-3">
            <button
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg
                   bg-indigo-600 py-3 text-sm font-semibold text-white
                   hover:bg-indigo-500 transition"
            >
              <Sparkles size={18} />
              Générer des exercices
            </button>

            <button
              className="flex w-full cursor-pointer items-center justify-center gap-2
                   border border-slate-200 dark:border-slate-800
                   bg-slate-50 dark:bg-slate-800 py-3 text-sm font-medium
                   hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              <Languages size={18} />
              Traduire un document
            </button>
          </div>
        </div>

        {/* System Activity */}
        <div className="rounded-xs shadow-slate-950 dark:shadow-md transition hover:shadow-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
          <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Activité système
          </h3>

          <div className="relative space-y-6">
            <div className="absolute left-1.75 top-2 bottom-2 w-px bg-slate-300 dark:bg-slate-700" />

            {[1, 2, 3].map((_, i) => (
              <div key={i} className="relative flex gap-4">
                <div className="z-10 mt-1 h-4 w-4 rounded-full border-2 border-indigo-800 bg-white dark:bg-slate-900" />
                <div>
                  <p className="text-sm font-medium">Export PDF terminé</p>
                  <p className="text-xs text-slate-500">
                    Physique_Chap3.pdf • 14:30
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
