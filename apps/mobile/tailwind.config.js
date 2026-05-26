/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#09090b', // zinc-950
        card: '#18181b', // zinc-900
        primary: '#f59e0b', // amber-500
        muted: '#27272a', // zinc-800
        border: '#27272a',
      }
    },
  },
  plugins: [],
}
