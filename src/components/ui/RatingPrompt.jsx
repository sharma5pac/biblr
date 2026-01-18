import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { Button } from '../ui/Button'

export function RatingPrompt() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        // Check if we should show prompt
        const checkPrompt = () => {
            const hasRated = localStorage.getItem('lumina_rated')
            const installDate = localStorage.getItem('lumina_install_date')
            const visits = parseInt(localStorage.getItem('lumina_visits') || '0')

            if (hasRated) return

            // Show if installed > 3 days ago AND visited > 5 times
            const daysSinceInstall = installDate ? (Date.now() - parseInt(installDate)) / (1000 * 60 * 60 * 24) : 0

            if (daysSinceInstall > 3 && visits > 5) {
                // Determine if we should show it now (random chance or specific trigger)
                if (Math.random() > 0.7) setVisible(true)
                // For demo purposes, we can trigger it more easily or via a hook
            }
        }

        // Track visit
        const currentVisits = parseInt(localStorage.getItem('lumina_visits') || '0')
        localStorage.setItem('lumina_visits', (currentVisits + 1).toString())
        if (!localStorage.getItem('lumina_install_date')) {
            localStorage.setItem('lumina_install_date', Date.now().toString())
        }

        // Timeout to check prompt (so it doesn't appear immediately on load)
        const timer = setTimeout(checkPrompt, 10000)
        return () => clearTimeout(timer)
    }, [])

    const handleRate = () => {
        localStorage.setItem('lumina_rated', 'true')
        alert("Thank you! You would be redirected to the App Store.") // Mock redirection
        setVisible(false)
    }

    const handleDismiss = () => {
        // Snooze for a while? Or just dismiss
        setVisible(false)
    }

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 z-50 glass-dark p-6 rounded-2xl shadow-2xl border border-bible-gold/30"
                >
                    <button
                        onClick={handleDismiss}
                        className="absolute top-4 right-4 text-slate-400 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center">
                        <div className="w-12 h-12 bg-bible-gold/20 rounded-full flex items-center justify-center mb-4">
                            <Star className="w-6 h-6 text-bible-gold fill-bible-gold" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Enjoying Lumina?</h3>
                        <p className="text-slate-300 text-sm mb-6">
                            If you're finding spiritual value in our app, would you mind taking a moment to rate us? It helps us reach more believers.
                        </p>

                        <div className="w-full space-y-3">
                            <Button onClick={handleRate} className="w-full bg-bible-gold text-white hover:bg-yellow-600">
                                Rate Lumina
                            </Button>
                            <button
                                onClick={handleDismiss}
                                className="text-slate-400 text-sm hover:text-white transition-colors"
                            >
                                Maybe later
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
