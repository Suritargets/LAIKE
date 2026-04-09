import type { Metadata } from "next";
import { Barlow, DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ModalProvider } from "@/components/ModalProvider";
import "./globals.css";

const barlow = Barlow({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

export const metadata: Metadata = {
  title: "SurveyFlow — AI-Powered Survey CAD Platform",
  description:
    "Van veldmeting naar officiële kaart in 15 minuten. AI-powered Survey CAD voor landmeters in Suriname & de Caribbean.",
  keywords: [
    "SurveyFlow",
    "landmeter",
    "kadaster",
    "survey CAD",
    "RW5",
    "CRD",
    "Suriname",
    "Caribbean",
  ],
  authors: [{ name: "Logix Layer N.V. / Suritargets N.V." }],
  openGraph: {
    type: "website",
    title: "SurveyFlow — AI-Powered Survey CAD Platform",
    description:
      "Van veldmeting naar officiële kaart in 15 minuten. AI-powered Survey CAD voor landmeters in Suriname & de Caribbean.",
    locale: "nl_SR",
  },
  twitter: {
    card: "summary_large_image",
    title: "SurveyFlow — AI-Powered Survey CAD Platform",
    description:
      "Van veldmeting naar officiële kaart in 15 minuten. AI-powered Survey CAD voor landmeters in Suriname & de Caribbean.",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><circle cx='16' cy='16' r='14' fill='%230a0c0f' stroke='%2322c55e' stroke-width='2'/><circle cx='16' cy='16' r='4' fill='%2322c55e'/></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      data-theme="dark"
      className={`${barlow.variable} ${dmSans.variable} ${dmMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen">
        <ThemeProvider>
          <ModalProvider>{children}</ModalProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
