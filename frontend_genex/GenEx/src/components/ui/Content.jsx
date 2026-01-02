import React from 'react'
import DashboardScreen from './screens/DashboardScreen.jsx'

export default function Content() {
  return (
    <div className="flex  h-full  p-2 bg-slate-100/50 dark:bg-slate-900 border-b border-slate-300 ring-0.5 dark:border-slate-800 shadow-md no-scrollbar overflow-y-auto">
       <DashboardScreen/>
    </div>
  )
}
