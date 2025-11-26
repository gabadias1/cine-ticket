import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const variants = {
    primary: 'bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:shadow-primary/50',
    secondary: 'bg-surface border border-white/10 text-white hover:bg-white/5',
    outline: 'bg-transparent border-2 border-primary text-primary hover:bg-primary/10',
    ghost: 'bg-transparent text-gray-300 hover:text-white hover:bg-white/5',
    danger: 'bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30',
};

const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg font-semibold',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    onClick,
    disabled = false,
    type = 'button',
    icon: Icon
}) {
    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={twMerge(
                'relative overflow-hidden rounded-xl transition-all duration-300 flex items-center justify-center gap-2',
                variants[variant],
                sizes[size],
                disabled && 'opacity-50 cursor-not-allowed grayscale',
                className
            )}
            onClick={onClick}
            disabled={disabled}
            type={type}
        >
            {Icon && <Icon className="w-5 h-5" />}
            {children}

            {/* Shine effect for primary buttons */}
            {variant === 'primary' && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            )}
        </motion.button>
    );
}
