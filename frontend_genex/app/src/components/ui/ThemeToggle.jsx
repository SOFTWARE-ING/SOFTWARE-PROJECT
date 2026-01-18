/* eslint-disable react-hooks/set-state-in-effect */
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

const ThemeToggle = () => {
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.classList[savedTheme === "dark" ? "add" : "remove"]("dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  } 

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center justify-center gap-2 
                 border border-slate-300 dark:border-slate-800
                 rounded-md p-2
                 bg-white dark:bg-slate-900
                 hover:bg-slate-100 dark:hover:bg-slate-800
                 transition-all duration-300"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-400" />
      ) : (
        <Moon className="h-5 w-5 text-slate-600" />
      )}
    </button>
  )
}

export default ThemeToggle
