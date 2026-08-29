import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import FloatingWealthAssistant from "@/components/wealth-assistant/FloatingWealthAssistant";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  ),

  title: {
    default:
      "Wealth Growth — Smart Financial Management",
    template: "%s | Wealth Growth",
  },

  description:
    "Wealth Growth helps you track expenses, plan budgets, monitor investments, analyze reports, manage financial goals, and make better financial decisions.",

  applicationName: "Wealth Growth",

  keywords: [
    "personal finance",
    "expense tracker",
    "budget planner",
    "investment tracker",
    "financial goals",
    "wealth management",
    "financial analysis",
    "wealth assistant",
  ],

  authors: [
    {
      name: "Wealth Growth",
    },
  ],

  creator: "Wealth Growth",
  publisher: "Wealth Growth",

  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: [
      {
        url: "/favicon-circle.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    shortcut: ["/favicon-circle.png"],
    apple: [
      {
        url: "/favicon-circle.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
  },

  openGraph: {
    type: "website",
    siteName: "Wealth Growth",
    title:
      "Wealth Growth — Smart Financial Management",
    description:
      "Track expenses, plan budgets, monitor investments, analyze reports, and achieve your financial goals.",
    images: [
      {
        url: "/logomain.png",
        width: 512,
        height: 512,
        alt: "Wealth Growth logo",
      },
    ],
  },

  twitter: {
    card: "summary",
    title:
      "Wealth Growth — Smart Financial Management",
    description:
      "A smarter way to manage your finances, investments, budgets, and goals.",
    images: ["/logomain.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen bg-[#020617] font-sans text-white">
        <div className="flex min-h-screen flex-col">
          <main className="flex-1">
            {children}
          </main>

          <FloatingWealthAssistant />
        </div>
      </body>
    </html>
  );
}
