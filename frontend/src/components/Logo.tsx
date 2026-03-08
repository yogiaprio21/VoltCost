import React from 'react'

interface LogoProps {
    className?: string
    size?: number
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <svg
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-sm"
            >
                <rect width="24" height="24" rx="6" fill="url(#logo-gradient)" />
                <path
                    d="M13 5L7 14H12L11 19L17 10H12L13 5Z"
                    fill="white"
                    stroke="white"
                    strokeWidth="0.5"
                    strokeLinejoin="round"
                />
                <defs>
                    <linearGradient
                        id="logo-gradient"
                        x1="0"
                        y1="0"
                        x2="24"
                        y2="24"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#2563EB" />
                        <stop offset="1" stopColor="#4F46E5" />
                    </linearGradient>
                </defs>
            </svg>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                VoltCost
            </span>
        </div>
    )
}
