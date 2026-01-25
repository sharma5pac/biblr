import { motion } from 'framer-motion'
import { Moon, Sun, Type, Volume2, Bell, Database, ChevronRight, LogOut } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'
import { useSettings } from '../../context/SettingsContext'

export function SettingsPage() {
    const { user, logout } = useAuth()
    const { settings, updateSetting, clearSettingsCache } = useSettings()

    const settingsSections = [
        {
            title: 'Appearance',
            icon: Moon,
            items: [
                // Theme option removed - Enforced Dark Mode
                {
                    label: 'Font Size',
                    value: settings.fontSize,
                    options: ['Small', 'Medium', 'Large', 'Extra Large'],
                    onChange: (val) => updateSetting('fontSize', val.toLowerCase()),
                    icon: Type
                }
            ]
        },
        {
            title: 'Audio',
            icon: Volume2,
            items: [
                {
                    label: 'Auto-play Next Chapter',
                    value: settings.autoPlay,
                    type: 'toggle',
                    onChange: (v) => updateSetting('autoPlay', v)
                }
            ]
        },

    ]

    return (
        <div className="max-w-2xl mx-auto px-4 pb-24">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-serif font-bold glow-text text-bible-gold mb-2">Settings</h1>
                <p className="text-slate-400">Customize your Lumina experience</p>
            </div>

            {/* Profile Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass rounded-2xl p-6 mb-6"
            >
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-bible-gold to-yellow-600 flex items-center justify-center text-2xl font-bold text-slate-900 shadow-lg">
                        {user ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=EAB308&color=0F172A`;
                            }} />
                        ) : (
                            'G'
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-slate-800 dark:text-white text-lg">
                            {user ? user.name : 'Guest'}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {user ? user.email : 'Sign in to sync your data'}
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                </div>
            </motion.div>

            {/* Settings Sections */}
            {settingsSections.map((section, idx) => (
                <motion.div
                    key={section.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="mb-6"
                >
                    <div className="flex items-center gap-2 mb-3 px-2">
                        <section.icon className="w-5 h-5 text-bible-gold" />
                        <h2 className="font-semibold text-slate-800 dark:text-white">{section.title}</h2>
                    </div>

                    <div className="glass rounded-2xl overflow-hidden">
                        {section.items.map((item, itemIdx) => (
                            <div
                                key={item.label}
                                className={`p-4 flex items-center justify-between ${itemIdx !== section.items.length - 1 ? 'border-b border-white/5' : ''
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    {item.icon && <item.icon className="w-5 h-5 text-slate-400" />}
                                    <span className="text-slate-700 dark:text-slate-200">{item.label}</span>
                                </div>

                                {item.type === 'toggle' ? (
                                    <button
                                        onClick={() => item.onChange(!item.value)}
                                        className={`w-12 h-6 rounded-full transition-colors ${item.value ? 'bg-bible-gold' : 'bg-slate-300 dark:bg-slate-700'
                                            }`}
                                    >
                                        <div className={`w-5 h-5 rounded-full bg-white shadow-lg transition-transform ${item.value ? 'translate-x-6' : 'translate-x-0.5'
                                            }`} />
                                    </button>
                                ) : (
                                    <select
                                        value={item.value}
                                        onChange={(e) => item.onChange(e.target.value)}
                                        className="bg-white dark:bg-bible-bg text-slate-800 dark:text-bible-text px-3 py-1 rounded-lg border border-slate-200 dark:border-bible-glass-border focus:border-bible-gold outline-none transition-colors"
                                    >
                                        {item.options.map(opt => (
                                            <option key={opt} value={opt.toLowerCase()}>{opt}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            ))}

            {/* Data Management */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass rounded-2xl p-4 mb-6"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Database className="w-5 h-5 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-200">Clear Cache</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={clearSettingsCache}>Clear</Button>
                </div>
            </motion.div>

            {/* Authentication */}
            {user ? (
                <Button
                    variant="ghost"
                    className="w-full gap-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 h-12"
                    onClick={logout}
                >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                </Button>
            ) : (
                <Button
                    className="w-full h-12 bg-bible-gold text-slate-900 hover:bg-yellow-500 font-bold"
                    onClick={() => window.location.href = '/community'} // Or trigger auth modal
                >
                    Sign In with Google
                </Button>
            )}

            {/* Version */}
            <p className="text-center text-slate-500 text-sm mt-8">
                Lumina Bible v1.0.0
            </p>
        </div>
    )
}
