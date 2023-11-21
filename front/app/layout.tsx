import { ColorSchemeScript, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Orbitron } from "next/font/google";
import "./globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Driving Gorilla",
  description: "Drive to Earn, Use for Fun.",
};

const orbitron = Orbitron({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon.png" />
        <meta name="theme-color" content="#a8a6a3" />
        <ColorSchemeScript />
      </head>
      <body className={`${inter.className} ${orbitron.className}`} style={{ overflow: "hidden" }}>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
