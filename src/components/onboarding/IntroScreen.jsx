import { motion } from 'framer-motion'

export function IntroScreen() {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]">
            <div className="text-center">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="mb-4"
                >
                    <img
                        src="/logo.png"
                        alt="Lumina Bible"
                        className="w-32 h-32 mx-auto rounded-3xl shadow-2xl shadow-yellow-500/20"
                    />
                </motion.div>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <h1 className="text-3xl font-serif font-bold text-[#EAB308]">
                        Lumina
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Bible
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
