/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50:"#eef2ff",100:"#e0e7ff",200:"#c7d2fe",300:"#a5b4fc",
          400:"#818cf8",500:"#6366f1",600:"#4f46e5",700:"#4338ca",800:"#3730a3",900:"#312e81"
        },
        accent: { 400:"#34d399", 500:"#10b981", 600:"#059669" }, // mint
        warn:   { 500:"#fb7185" },                               // rose
      },
      boxShadow: { soft: "0 12px 40px rgba(79,70,229,.15)" },
      borderRadius: { '2xl': '1.25rem' },
    },
  },
  plugins: [],
};
