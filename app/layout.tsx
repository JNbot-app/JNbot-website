import type React from "react";
import type { Metadata } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { asset } from "@/lib/site"

const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-jetbrains",
  display: "swap",
});

const siteDescription =
  "Automate Minecraft tasks with JNbot. Collect kits, run AFK scripts, and manage accounts in one free, open-source desktop app for Windows, macOS, and Linux.";

export const metadata: Metadata = {
  metadataBase: new URL("https://jnbot.netlify.app"),
  title: {
    default: "JNbot — Automate Repetitive Minecraft Tasks",
    template: "%s · JNbot",
  },
  description: siteDescription,
  keywords: [
    "minecraft automation",
    "minecraft bot",
    "minecraft macro",
    "minecraft afk bot",
    "automate minecraft",
    "gkit collector",
    "alt scanner",
    "minecraft multi account",
    "minecraft scripting",
  ],
  applicationName: "JNbot",
  icons: {
    icon: asset("/favicon.ico"),
    apple: asset("/apple-touch-icon.png"),
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "https://jnbot.netlify.app/",
    siteName: "JNbot",
    title: "JNbot — Automate Repetitive Minecraft Tasks",
    description: siteDescription,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "JNbot — automate repetitive Minecraft tasks across as many accounts as you want",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JNbot — Automate Repetitive Minecraft Tasks",
    description: siteDescription,
    images: ["/og.png"],
  },
  verification: {
    google: "Nmy_yJyzUkWzCLRUBycWhkKVpwFRH8wwCG20rd_dd28",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${archivo.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
