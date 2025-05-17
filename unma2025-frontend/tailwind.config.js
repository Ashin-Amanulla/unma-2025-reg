/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        container: {
            center: true,
            padding: {
                DEFAULT: '1rem',
                sm: '2rem',
                lg: '4rem',
                xl: '5rem',
            },
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#3b82f6', // blue-500
                    dark: '#2563eb',    // blue-600
                    light: '#60a5fa',   // blue-400
                },
                secondary: {
                    DEFAULT: '#6b7280', // gray-500
                    dark: '#4b5563',    // gray-600
                    light: '#9ca3af',   // gray-400
                },
                accent: {
                    DEFAULT: '#f59e0b', // amber-500
                    dark: '#d97706',    // amber-600
                    light: '#fbbf24',   // amber-400
                },
                background: {
                    DEFAULT: '#f9fafb', // gray-50
                    dark: '#f3f4f6',    // gray-100
                },
                'text-base': 'rgb(var(--color-text) / <alpha-value>)',
                'text-light': 'rgb(var(--color-text-light) / <alpha-value>)',
            },
            fontFamily: {
                sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                heading: ['Montserrat', 'ui-sans-serif', 'system-ui', 'sans-serif'],
            },
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                '4xl': '2rem',
            },
            boxShadow: {
                'inner-lg': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
            },
            typography: (theme) => ({
                DEFAULT: {
                    css: {
                        color: theme('colors.text-base'),
                        a: {
                            color: theme('colors.primary'),
                            '&:hover': {
                                color: theme('colors.primary-dark'),
                            },
                        },
                        h1: {
                            color: theme('colors.text-base'),
                            fontFamily: theme('fontFamily.heading').join(', '),
                        },
                        h2: {
                            color: theme('colors.text-base'),
                            fontFamily: theme('fontFamily.heading').join(', '),
                        },
                        h3: {
                            color: theme('colors.text-base'),
                            fontFamily: theme('fontFamily.heading').join(', '),
                        },
                        h4: {
                            color: theme('colors.text-base'),
                            fontFamily: theme('fontFamily.heading').join(', '),
                        },
                    },
                },
            }),
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
    ],
} 