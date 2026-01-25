import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Check, BookOpen, Users, Sparkles, Bell } from 'lucide-react'
import { Button } from '../ui/Button'

export function Onboarding({ onComplete }) {
    const [step, setStep] = useState(0)

    const steps = [
        {
            title: "Welcome to Lumina",
            description: "Experience the Bible like never before with AI-powered insights and community.",
            icon: Sparkles,
            image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800&q=80"
        },
        {
            title: "Smart Insights",
            description: "Get deep historical context and life applications for every verse instantly.",
            icon: BookOpen,
            image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80"
        },
        {
            title: "Join the Community",
            description: "Connect with believers, share prayer requests, and grow together.",
            icon: Users,
            image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&q=80"
        },
        {
            title: "Stay Connected",
            description: "Turn on notifications for daily verses and prayer reminders.",
            icon: Bell,
            image: "https://images.unsplash.com/photo-1516733968668-dbdce39c4651?w=800&q=80"
        }
    ]

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1)
        } else {
            completeOnboarding()
        }
    }

    const completeOnboarding = () => {
        localStorage.setItem('lumina_onboarding_completed', 'true')
        onComplete()
    }

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0f1a] flex flex-col items-center justify-center p-6 text-center">
            <div className="w-full max-w-md flex flex-col h-full max-h-[800px] relative">
                {/* Skip Button */}
                <button
                    onClick={completeOnboarding}
                    className="absolute top-0 right-0 text-slate-400 text-sm hover:text-white"
                >
                    Skip
                </button>

                {/* Content Area */}
                <div className="flex-1 flex flex-col items-center justify-center mt-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="flex flex-col items-center"
                        >
                            <div className="relative w-64 h-64 mb-8 rounded-full overflow-hidden border-4 border-bible-gold/20 shadow-2xl shadow-bible-gold/10">
                                <img
                                    src={steps[step].image}
                                    alt={steps[step].title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] to-transparent opacity-60" />
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-12 h-12 bg-bible-gold rounded-xl flex items-center justify-center shadow-lg">
                                    {(() => {
                                        const Icon = steps[step].icon
                                        return <Icon className="w-6 h-6 text-slate-900" />
                                    })()}
                                </div>
                            </div>

                            <h2 className="text-3xl font-serif font-bold text-white mb-4">
                                {steps[step].title}
                            </h2>
                            <p className="text-slate-400 text-lg leading-relaxed max-w-xs mx-auto">
                                {steps[step].description}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Footer Controls */}
                <div className="mt-auto mb-8 w-full">
                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mb-8">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`h-2 rounded-full transition-all duration-300 ${i === step ? 'w-8 bg-bible-gold' : 'w-2 bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button
                        onClick={handleNext}
                        className="w-full py-4 text-lg rounded-xl shadow-xl shadow-bible-gold/20"
                    >
                        {step === steps.length - 1 ? (
                            <span className="flex items-center gap-2">Get Started <Check className="w-5 h-5" /></span>
                        ) : (
                            <span className="flex items-center gap-2">Next <ChevronRight className="w-5 h-5" /></span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
