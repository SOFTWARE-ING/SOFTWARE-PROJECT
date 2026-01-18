import React, { useState } from 'react'
import { User, Palette, Globe, Shield, Bell } from 'lucide-react'

export default function SettingsScreen() {
  const [profile, setProfile] = useState({
    name: 'Utilisateur',
    email: 'user@example.com',
    avatar: null
  })

  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'fr',
    notifications: true
  })

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handlePreferenceChange = (field, value) => {
    setPreferences(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-8 w-8 text-indigo-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
          Paramètres
        </h1>
      </div>

      {/* Section Profil */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <User className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Profil Utilisateur
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Nom complet
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Adresse email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Photo de profil
          </label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center">
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = () => handleProfileChange('avatar', reader.result)
                  reader.readAsDataURL(file)
                }
              }}
              className="text-sm text-slate-600 dark:text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </div>
      </div>

      {/* Section Préférences */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Préférences
          </h2>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Thème
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={preferences.theme === 'light'}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="mr-2"
                />
                <span className="text-slate-700 dark:text-slate-300">Clair</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={preferences.theme === 'dark'}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="mr-2"
                />
                <span className="text-slate-700 dark:text-slate-300">Sombre</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="theme"
                  value="auto"
                  checked={preferences.theme === 'auto'}
                  onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  className="mr-2"
                />
                <span className="text-slate-700 dark:text-slate-300">Automatique</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Langue
            </label>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-slate-400" />
              <select
                value={preferences.language}
                onChange={(e) => handlePreferenceChange('language', e.target.value)}
                className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="fr">Français</option>
                <option value="en">English</option>
                <option value="es">Español</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Notifications
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recevoir des notifications par email
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications}
                onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Section Sécurité */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Sécurité
          </h2>
        </div>

        <div className="space-y-4">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
            Changer le mot de passe
          </button>
          <button className="ml-4 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
            Activer l'authentification à deux facteurs
          </button>
        </div>
      </div>

      {/* Boutons d'action */}
      <div className="flex justify-end gap-4 pt-6">
        <button className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
          Annuler
        </button>
        <button className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors">
          Sauvegarder
        </button>
      </div>
    </div>
  )
}
