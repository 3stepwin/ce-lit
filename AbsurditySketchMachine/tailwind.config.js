/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./components/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                // Absurd Premium Dark Theme
                background: '#0A0A0F',
                surface: '#16161F',
                surfaceHover: '#1E1E2A',

                // Neon accents
                primary: '#FF00FF',
                primaryGlow: 'rgba(255,0,255,0.3)',
                accent: '#00FFFF',
                accentGlow: 'rgba(0,255,255,0.3)',

                // Status colors
                success: '#00FF88',
                warning: '#FFD700',
                error: '#FF3366',

                // Text
                textPrimary: '#FFFFFF',
                textMuted: '#888899',
                textSubtle: '#555566',
            },
            fontFamily: {
                heading: ['Impact', 'system-ui', 'sans-serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
                meme: ['Impact', 'system-ui', 'sans-serif'],
            },
            boxShadow: {
                neon: '0 0 20px rgba(255,0,255,0.5)',
                subtle: '0 4px 20px rgba(0,0,0,0.5)',
                glow: '0 0 40px rgba(255,0,255,0.8)',
            },
            animation: {
                'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                'pulse-neon': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(255,0,255,0.5)' },
                    '50%': { boxShadow: '0 0 40px rgba(255,0,255,0.8)' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'glow': {
                    'from': { textShadow: '0 0 10px rgba(255,0,255,0.5)' },
                    'to': { textShadow: '0 0 20px rgba(255,0,255,0.8), 0 0 30px rgba(0,255,255,0.5)' },
                },
            },
        },
    },
    plugins: [],
};
