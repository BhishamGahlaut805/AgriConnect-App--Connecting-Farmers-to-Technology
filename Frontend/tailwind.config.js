import { defineConfig } from "tailwindcss";
export default defineConfig({
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    ],
    theme: {
        darkMode: 'class',
    },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/aspect-ratio"),
  ],
}
);


