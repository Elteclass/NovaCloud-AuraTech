/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Se escanean todos los templates y componentes
  ],
  theme: {
    extend: {
      colors: {
        // En este bloque se definen los colores personalizados para auratech
        'brand-primary': '#1E1B4B',
        'brand-accent': '#8B5CF6'
      }
    },
  },
  plugins: [],
}
