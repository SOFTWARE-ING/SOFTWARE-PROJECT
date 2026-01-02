import { ChevronDown , ChevronRight} from "lucide-react"
import { useState, useRef, useEffect } from "react"

const Dropdown = ({ label = "Options", items = [] }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Fermer au clic extérieur
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={ref} className="relative inline-block text-left">
      
      {/* Bouton */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center cursor-pointer justify-between gap-2 px-4 py-2
                   rounded-sm bg-white/80 dark:bg-slate-900
                   text-sm font-medium text-slate-700 dark:text-slate-200
                   hover:bg-slate-100 dark:hover:bg-slate-800
                   transition"
      >
        {label}
        <ChevronRight
          className={`h-4 w-4 transition-transform ${
            open ? "rotate-90" : ""
          }`}
        />
      </button>

      {/* Menu */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 z-50
                     rounded-sm border border-slate-100 dark:border-slate-800
                     bg-white/80 dark:bg-slate-900
                     shadow-lg overflow-hidden"
        >
          {items.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                item.onClick?.()
                setOpen(false)
              }}
              className="w-full text-left px-4 py-2 text-sm
                         text-slate-700 dark:text-slate-200
                         hover:bg-slate-500/10  cursor-pointer dark:hover:bg-slate-800
                         transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default Dropdown
