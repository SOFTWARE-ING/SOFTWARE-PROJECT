import React from "react"
import Sidebar from "../ui/Sidebar"
import Topbar from "../ui/Topbar"
import TopMenubar from "../ui/TopMenubar"
import Content from "../ui/Content"

export default function Dashboard() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-100/50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">

      {/* Topbar — reste visible sans fixed */}
      <div className="sticky top-0 z-50">
        <Topbar />
      </div>

      {/* Body */}
      <div className="flex tail mt-1">
        {/* 64px = hauteur de Topbar */}

        {/* Sidebar */}
        <Sidebar />

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* TopMenubar (optionnellement sticky aussi) */}
          <div className="sticky top-0 z-40 bg-slate-100/50 dark:bg-slate-900 ">
            <TopMenubar />
          </div>

          {/* Scroll area */}
          <div className="flex-1 overflow-hidden no-scrollbar p-4">
            <Content />
          </div>

        </div>
      </div>
    </div>
  )
}
