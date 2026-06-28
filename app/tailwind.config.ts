import type { Config } from "tailwindcss";
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0A0E27", ocean: "#2563EB", teal: "#22D3EE", lav: "#818CF8", ice: "#E0F2FE",
      },
    },
  },
  plugins: [],
} satisfies Config;
