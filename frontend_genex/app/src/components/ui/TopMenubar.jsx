import React, { useEffect, useState } from 'react'
import { PanelRightOpen, ChevronRight, Settings } from 'lucide-react'
import ThemeToggle from './ThemeToggle'
import Dropdown from './Dropdown'
import { useAuth } from "../Context_api.jsx";

// TopMenubar Component
export default function TopMenubar() {

    // Dropdown data
    const themes = [
        { code: 'light', label: 'Light' },
        { code: 'dark', label: 'Dark' },
        { code: 'system', label: 'System' },
    ];

    // Language data
    const languages = [
        { code: 'en', label: 'English' },
        { code: 'es', label: 'Spanish' },
        { code: 'fr', label: 'French' },
    ];

    // Settings data
    const dataSettings = [
        {code: 'settings', label: 'Settings'},
        {code: 'preferences', label: 'Preferences'},
        {code: 'help', label: 'Help'},
    ]
    


// State management
    const [isLanguageSelected, setIsLanguageSelected] = useState('en'); 
    // Theme state
    const [isThemeSelected, setIsThemeSelected] = useState(() => {
        return localStorage.getItem("theme") || "system"
    })

// Theme toggle function
    const toggleTheme = (theme) => {

        if (theme.code === 'dark') {
            document.documentElement.classList.add('dark')
        } else if (theme.code === 'light') {
            document.documentElement.classList.remove('dark')
        } else {
            const userPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', userPrefersDark);
        }
    };

// Effect to apply theme on selection change
    useEffect(() => {
        toggleTheme({ code: isThemeSelected });
        localStorage.setItem('theme', isThemeSelected);

    }, [isThemeSelected]);

    const { auth, getUser } = useAuth();
    const user = getUser()
    if (!auth.access_token) return null;

    if (auth.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

// Render component 
    return (
        <div className='flex  mx-0 space-x-4 border-b border-slate-300 dark:border-slate-800 items-center justify-between px-4 py-2 '>
            <div className='flex items-center space-x-4 '>
                <div className='p-2 ml-4 bg-linear-to-br items-center cursor-pointer active:scale-95 shadow-sm shadow-slate-400 justify-center flex rounded-xs from-emerald-300 via-blue-300 to-purple-500  '>
                    <div className=' flex items-center justify-center'>
                        <PanelRightOpen className='text-slate-700 h-full w-full dark:text-slate-200' />
                    </div>
                </div>
                <div className='flex flex-col '>
                    <h2 className="text-2xl text-slate-800 dark:text-slate-200 truncate tracking-[5px] font-black">Dashboard</h2>
                    <p className='text-xs text-slate-400 '> Welcome back!
                         <span className='font-thin text-xs py-0.5 px-1 dark:bg-emerald-300/20 bg-emerald-500/20 rounded-md dark:text-emerald-100 text-emerald-600 italic '>{user?.first_name || "Utilisateur"}</span></p>
                </div>
            </div>
            <div className='flex-1 flex justify-end items-center space-x-4'>
                <e-select>
                    <div className='flex items-center border ring-0.5 border-slate-300 dark:border-slate-800 rounded-sm px-4 py-2 cursor-pointer space-x-2'>
                        <p className='text-sm text-slate-500 dark:text-slate-400'>Theme:</p>
                        <Dropdown
                            label=""
                            // Dropdown items for themes
                            items={themes.map(theme => ({
                                label: theme.label,
                                onClick: () => {
                                    setIsThemeSelected(theme.code)
                                    console.log(isThemeSelected)
                                    toggleTheme(theme)
                                }
                            }))}
                        />

                    </div>
                </e-select>
                <div className='flex items-center border ring-0.5 border-slate-300 dark:border-slate-800 rounded-sm px-4 py-2 cursor-pointer space-x-2'>
                    <p className='text-sm text-slate-500 dark:text-slate-400'>Language:</p>
                    <Dropdown
                        label=""
                        // Dropdown items for languages
                        items={languages.map(lang => ({
                            label: lang.label,
                            onClick: () => {
                                setIsLanguageSelected(lang.code)
                                console.log(isLanguageSelected)
                            }
                        }))}
                    />
                </div>
                <div className='flex border ring-0.5 items-center justify-center border-slate-300 dark:border-slate-800 rounded-sm p-2 cursor-pointer'>
                    <Settings className='text-slate-400 fond-thin h-6 w-6' />
                    <Dropdown
                        label="Settings"
                        items={dataSettings.map(setting => ({
                            label: setting.label,
                            onClick: () => {
                                console.log(setting.code)
                            }
                        }))}
                    />
                </div>
                <div className='flex border ring-0.5 border-slate-300 dark:border-slate-800 rounded-sm p-2 cursor-pointer '>
                    <div className=' flex items-center justify-center  overflow-hidden p-0.5  border-r '>
                        <img className=' ring-1 p-0.5 rounded-full mr-1' src="/src/assets/react.svg" alt="User Avatar" />
                    </div>
                    <div className='flex flex-col ml-2 justify-center'>
                        <h3 className='text-md tracking-[0.3rem] font-thin text-slate-800 dark:text-slate-200 '>Magistral</h3>
                        <p className='text-xs text-slate-400 '> Teacher </p>
                    </div>
                    <Dropdown
                        label=""
                        items={[
                            { label: "Profile", onClick: () => console.log("Profile") },
                            { label: "Settings", onClick: () => console.log("Settings") },
                            { label: "Logout", onClick: () => console.log("Logout") },
                        ]}
                    />
                </div>
            </div>

        </div>
    )
}
