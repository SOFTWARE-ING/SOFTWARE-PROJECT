import React from 'react'
import { Cpu, Linkedin } from 'lucide-react'
import { NavLink } from "react-router-dom"

export default function Topbar() {

    return (
        <div className="top-0 left-0 right-0 z-50 w-screen bg-slate-100/50 dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 h-16 p-0">
            <div className="p-4 flex items-center justify-between">
                <div className="flex flex-col space-x-4">
                    <div className='flex space-x-2 '>
                        <Cpu className='w-6 h-6 dark:text-slate-200 ' />
                        <h2 className="text-lg font-bold">GenEx-PDF</h2>
                    </div>
                </div>
                
                <div className='flex items-center justify-end space-x-4'>
                    <button className="px-4 py-1 border border-slate-300 ring-0.5 dark:border-slate-800  text-slate-500 hover:bg-zinc-300 active:scale-95 dark:hover:bg-slate-800 hover:text-red-50 dark:shadow-slate-950 shadow-slate-400 hover:shadow-sm cursor-pointer  transition"><Linkedin className='w-6 h-6'/></button>
                    <button className="px-4 py-1 bg-red-500/10 text-red-500 hover:bg-red-600 active:scale-95 hover:text-red-50 dark:shadow-slate-950 shadow-slate-400 shadow-sm cursor-pointer  transition">Log Out</button>
                    <button className="px-4 py-1 bg-slate-500/15 text-slate-500 hover:bg-slate-600 active:scale-95 hover:text-red-50 dark:shadow-slate-950 shadow-slate-400 shadow-sm cursor-pointer  transition"><NavLink to="/register">Sign Up</NavLink></button>
                    <button className="px-4 py-1 bg-slate-500/15 text-slate-500 hover:bg-violet-900 active:scale-95 hover:text-red-50 dark:shadow-slate-950 shadow-slate-400 shadow-sm cursor-pointer  transition"><NavLink to="/login">Sign In</NavLink></button>
                </div>
            </div>
        </div>
    )
}
