import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                black: {
                    100: '#0F0F0F',
                    200: '#171717',
                    300: '#1F1F1F',
                    400: '#272727',
                    500: '#2F2F2F',
                    600: '#373737',
                    700: '#3F3F3F',
                    800: '#474747',
                    900: '#4F4F4F'
                },
                gray: {
                    500: '#808080'
                },
                white: {
                    100: '#B0B0B0',
                    200: '#B8B8B8',
                    300: '#C0C0C0',
                    400: '#C8C8C8',
                    500: '#D0D0D0',
                    600: '#D8D8D8',
                    700: '#E0E0E0',
                    800: '#E8E8E8',
                    900: '#F0F0F0'
                }
            },
            fontFamily: {
                metropolis: ['Metropolis', 'sans-serif'],
            }
        },
    },
    plugins: [],
} satisfies Config;
