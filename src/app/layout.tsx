import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "INSIGHT - How well do your friends really know you?",
  description:
    "A multiplayer social party game where friends predict answers, uncover secret impostors, and find out what everyone really thinks.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#8b5cf6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-electric-purple selection:text-white">
        {children}
      </body>
    </html>
  );
}

