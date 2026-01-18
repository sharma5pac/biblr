import { useState, useEffect } from 'react'
import { WifiOff, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(!navigator.onLine)
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleOnline = () => {
            setIsOffline(false)
            setVisible(true)
            setTimeout(() => setVisible(false), 3000)
        }
        const handleOffline = () => {
            setIsOffline(true)
            setVisible(true)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className={`fixed top-0 left-0 right-0 z-[60] flex items-center justify-center px-4 py-2 text-sm font-medium ${isOffline ? 'bg-red-500/90 text-white' : 'bg-green-500/90 text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        {isOffline ? <WifiOff className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                        {isOffline ? 'You are currently offline. Some features may be limited.' : 'Back online!'}
                    </div>
                    {isOffline && (
                        <button
                            onClick={() => setVisible(false)}
                            className="ml-auto p-1 hover:bg-white/20 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    )
}
