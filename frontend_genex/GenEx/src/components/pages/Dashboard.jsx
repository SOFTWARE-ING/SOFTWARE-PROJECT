import React from 'react'
import Sidebar from '../ui/Sidebar'
import Topbar from '../ui/Topbar'
import TopMenubar from '../ui/TopMenubar'

export default function Dashboard() {
  return (
    <div className="flex flex-col h-screen">
        <div className='w-screen'><Topbar/></div>
        <div className='flex flex-1 h-full'>
            <div className=''><Sidebar/></div>
            <div className='flex-1 overflow-auto py-4 px-0 bg-slate-100/50 dark:bg-slate-900 border-b border-slate-300 ring-0.5 dark:border-slate-800'>
                <TopMenubar/>
                <div className='mt-4 bg-slate-100/50 dark:bg-slate-900 border-b border-t border-slate-300 ring-0.5 dark:border-slate-800  h-full p-4  shadow-md overflow-auto'>
                  Dashboard Content Area
                </div>
            </div>
        </div>
        

    </div>
  )
}
