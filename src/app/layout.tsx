import type { Metadata } from "next";
import { JetBrains_Mono, Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { ThemeProvider, ThemeScript } from "@/components/theme-provider";
import { BRAND } from "@/config/brand";
import "./globals.css";

/*
 * Three faces, three jobs. Each one is loaded once here and handed to the
 * stylesheet as a custom property; globals.css is where those raw family names
 * get their ROLE (--font-sans / --font-serif / --font-mono), and nothing outside
 * globals.css should ever name a family directly.
 *
 * The names next/font generates are hashed (`__Source_Serif_4_a1b2c3`), so the
 * literal "Source Serif 4" would not resolve anywhere -- the variable is the
 * only handle on these faces, including for Monaco's fontFamily option.
 */

/* Display face. Headings only.
 *
 * Source Serif 4 carries an optical-size axis, and requesting it is the whole
 * point of choosing this face: without `axes: ["opsz"]` Google serves the
 * weight-only cut with opsz pinned at its 14pt default, so a 68px hero heading
 * would be drawn with the thickened stems and open spacing a footnote needs.
 * With the axis present, `font-optical-sizing: auto` (the CSS initial value,
 * restated on the heading rule in globals.css) lets the browser pick opsz from
 * the rendered size -- fine hairlines and tight fit at display sizes, sturdy
 * ones at body sizes. */
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  axes: ["opsz"],
});

/* Body and UI face. */
const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

/* Code face -- the editor, the generated Python, the terminal. */
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: BRAND.displayName,
    template: `%s | ${BRAND.displayName}`,
  },
  description: `${BRAND.displayName} is ${BRAND.description.charAt(0).toLowerCase()}${BRAND.description.slice(1)}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sourceSans.variable} ${sourceSerif.variable} ${jetbrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans text-[var(--foreground)]">
        <ThemeScript />
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
