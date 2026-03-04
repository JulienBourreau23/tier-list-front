import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import Footer from "@/components/layout/footer";
import Header from "@/components/layout/header";
import { QueryProvider } from "@/components/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Tier-list SW",
  description: "Tier-list summoners war",

  // Onglet du navigateur + favicon
  icons: { icon: "/favicon.ico" },

  // Quand quelqu'un partage ton lien sur Discord/Twitter
  openGraph: {
    title: "Tier-list Summoners War",
    description: "Classe tes monstres Summoners War",
    images: ["/og-image.png"], // une image de preview 1200x630px
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col `}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <Header />
            {children}
            <Footer />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
