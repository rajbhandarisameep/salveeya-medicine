/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#009688", // Tealish green
                    light: "#E0F2F1",
                    dark: "#00796B",
                },
                secondary: {
                    DEFAULT: "#F3F4F6", // Light gray backgrounds
                    dark: "#9CA3AF"
                },
                danger: {
                    DEFAULT: "#FEE2E2", // Light red bg
                    text: "#EF4444", // Red text
                },
                warning: {
                    DEFAULT: "#FEF3C7", // Light yellow
                    text: "#F59E0B", // Amber text
                }
            },
        },
    },
    plugins: [],
}
