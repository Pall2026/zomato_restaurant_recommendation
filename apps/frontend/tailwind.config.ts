import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                zomato: {
                    red: "#E23744",
                    dark: "#1C1C1C",
                    light: "#F8F8F8"
                }
            }
        },
    },
    plugins: [],
};
export default config;
