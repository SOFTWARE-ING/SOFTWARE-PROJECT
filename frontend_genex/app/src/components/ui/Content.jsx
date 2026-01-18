import { Routes, Route } from "react-router-dom"
import DashboardScreen from './screens/DashboardScreen.jsx'
import SettingsScreen from './screens/SettingsScreen.jsx'
import GenerateScreen from './screens/GenerateScreen.jsx'
import TranslateScreen from './screens/TranslateScreen.jsx'
import LibraryScreen from './screens/LibraryScreen.jsx'
import NewProjectScreen from './screens/NewProjectScreen.jsx'
import ProjectsScreen from './screens/ProjectsScreen.jsx'
import RegisterScreen from "./screens/RegisterScreen.jsx"
import LoginScreen from "./screens/LoginScreen.jsx"

export default function Content() {
  return (
    <div className="flex transition-all ease-in-out duration-300  h-full  p-2 bg-slate-100/50 dark:bg-slate-900 border-b border-slate-300 ring-0.5 dark:border-slate-800 shadow-md no-scrollbar overflow-y-auto">
      <Routes>
        <Route path="/" element={<DashboardScreen/>}/>
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/generate" element={<GenerateScreen />} />
        <Route path="/translate" element={<TranslateScreen />} />
        <Route path="/library" element={<LibraryScreen />} />
        <Route path="/new-project" element={<NewProjectScreen />} />
        <Route path="/projects" element={<ProjectsScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>
    </div>
  )
}
