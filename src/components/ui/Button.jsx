import { forwardRef } from 'react'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

const Button = forwardRef(({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-bible-gold/50 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:pointer-events-none'

    const variants = {
        primary: 'bg-gradient-to-r from-bible-gold to-yellow-500 text-slate-900 hover:from-yellow-400 hover:to-yellow-500 shadow-lg shadow-bible-gold/25',
        secondary: 'bg-white/5 backdrop-blur-sm border border-white/10 text-slate-100 hover:bg-white/10 hover:border-white/20',
        ghost: 'bg-transparent text-slate-100 hover:bg-white/5',
        outline: 'border border-white/20 text-slate-100 hover:bg-white/5 hover:border-white/30 backdrop-blur-sm'
    }

    const sizes = {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-5 py-2',
        lg: 'h-12 px-8 text-lg'
    }

    return (
        <button
            ref={ref}
            className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
            {...props}
        />
    )
})

Button.displayName = 'Button'
export { Button }
