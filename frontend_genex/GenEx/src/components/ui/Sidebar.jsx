import React from "react"
import {
  LayoutDashboard,
  Cpu,
  Languages,
  FolderOpen,
  Users,
  Settings,
  Zap,
  Plus,
  Briefcase,
} from "lucide-react"
import { NavLink } from "react-router-dom"


export default function Sidebar() {

  const menu = [
    { id: "dashboard", path: "/", icon: LayoutDashboard, label: "Vue d'ensemble" },
    { id: "generate", path: "/generate", icon: Cpu, label: "Générateur IA" },
    { id: "translate", path: "/translate", icon: Languages, label: "Traducteur PDF" },
    { id: "library", path: "/library", icon: FolderOpen, label: "Mes Documents" },
    { id: "new-project", path: "/new-project", icon: Plus, label: "Nouveau Projet" },
    { id: "projects", path: "/projects", icon: Briefcase, label: "Projets" },
    { id: "settings", path: "/settings", icon: Settings, label: "Paramètres" },
  ]


  return (
    <div className="flex h-full w-72 flex-col border-r border-slate-300 bg-slate-100/50 dark:border-slate-800 dark:bg-slate-900 p-2 transition-all ease-in-out duration-300 ">

      {/* Logo / Header */}
      <div className="mb-4 flex items-center justify-center rounded-xs p-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg animate-pulse hover:animate-none transition-all duration-300 group cursor-pointer">

        {/* Icon */}
        <Zap className="mr-2 h-6 w-6 text-white group-hover:scale-110 transition-transform duration-300" />

        {/* Texte */}
        <div className="flex flex-col items-start">
          {/* <span className="text-sm font-semibold uppercase tracking-wide">Upgrade!</span> */}
          <span className="text-sm font-semibold uppercase tracking-wide upgrade-shine">Upgrade!</span>

          <span className="text-xs font-medium opacity-90">Passez à la version Pro pour plus de fonctionnalités</span>
        </div>

      </div>


      {/* Menu */}
      <nav className="flex flex-1 flex-col gap-2">
        {menu.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={({ isActive }) => `
          group flex items-center gap-3 rounded-xs shadow-xs
          px-4 py-3 text-lg font-megium transition-colors duration-200
          ${isActive
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-600/20 dark:text-indigo-400"
                  : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }
        `}
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={20}
                    className={`
            ${isActive
                    ? "text-indigo-600 dark:text-indigo-400"
                    : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"
                  }
          `}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>


      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">v1.0.0</p>
      </div>
    </div>
  )
}
