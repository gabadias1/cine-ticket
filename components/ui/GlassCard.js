import React from 'react';
import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export default function GlassCard({
    children,
    className,
    hoverEffect = false,
    onClick
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hoverEffect ? { y: -5, boxShadow: '0 20px 40px -10px rgba(0,0,0,0.5)' } : {}}
            className={twMerge(
                'glass rounded-2xl p-6 relative overflow-hidden',
                hoverEffect && 'cursor-pointer glass-hover',
                className
            )}
            onClick={onClick}
        >
            {/* Gradient Glow Background */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/20 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}
