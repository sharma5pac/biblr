import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { useAuth } from '../../context/AuthContext'

export function AuthModal({ isOpen, onClose }) {
    const [loading, setLoading] = useState(false)
    const { loginWithGoogle } = useAuth()

    const handleGoogleSignIn = async () => {
        setLoading(true)
        try {
            await loginWithGoogle()
            onClose()
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-md glass-dark rounded-2xl p-8 relative border border-white/10"
                        >
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="text-center mb-8">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-bible-gold to-yellow-600 flex items-center justify-center mx-auto mb-4 glow-gold">
                                    <Sparkles className="w-8 h-8 text-slate-900" />
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-white mb-2">
                                    Join Lumina
                                </h2>
                                <p className="text-slate-400">
                                    Sign in to access your bookmarks, prayers, and the community.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <Button
                                    onClick={handleGoogleSignIn}
                                    className="w-full h-14 text-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-3 transition-all active:scale-95"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                    ) : (
                                        <>
                                            <LogIn className="w-6 h-6" />
                                            Sign in with Google
                                        </>
                                    )}
                                </Button>

                                <p className="text-center text-xs text-slate-500 pt-4">
                                    By signing in, you agree to our <br />
                                    <span className="underline cursor-pointer hover:text-slate-300">Privacy Policy</span> and <span className="underline cursor-pointer hover:text-slate-300">Terms of Service</span>.
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
