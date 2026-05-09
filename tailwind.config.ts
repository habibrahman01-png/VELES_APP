import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        uberBlack: "#000000",
        pureWhite: "#ffffff",
        chipGray: "#efefef",
        hoverGray: "#e2e2e2",
        hoverLight: "#f3f3f3",
        bodyGray: "#4b4b4b",
        mutedGray: "#afafaf",
        linkBlue: "#0000ee"
      },
      boxShadow: {
        subtle: "rgba(0,0,0,0.12) 0 4px 16px",
        medium: "rgba(0,0,0,0.16) 0 4px 16px",
        floating: "rgba(0,0,0,0.16) 0 2px 8px",
        pressed: "rgba(0,0,0,0.08) inset 0 0 0 9999px"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      fontSize: {
        hero: ["52px", { lineHeight: "1.23", fontWeight: "700" }],
        section: ["36px", { lineHeight: "1.22", fontWeight: "700" }],
        card: ["32px", { lineHeight: "1.25", fontWeight: "700" }],
        sub: ["24px", { lineHeight: "1.33", fontWeight: "700" }],
        small: ["20px", { lineHeight: "1.4", fontWeight: "700" }],
        nav: ["18px", { lineHeight: "1.33", fontWeight: "500" }],
        body: ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        caption: ["14px", { lineHeight: "1.43", fontWeight: "500" }],
        micro: ["12px", { lineHeight: "1.67", fontWeight: "400" }]
      },
      spacing: {
        1: "4px",
        2: "8px",
        3: "12px",
        4: "16px",
        5: "20px",
        6: "24px",
        8: "32px",
        12: "48px",
        16: "64px"
      }
    }
  },
  plugins: []
};

export default config;
