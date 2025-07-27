import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Multiplayer Pac-Mon Arena | Monad Blockchain Game",
  description: "Play multiplayer Pac-Mon on the Monad blockchain. Register with your unique username, pay 0.25 MON, and compete with players worldwide in this eye-catching blockchain game.",
  keywords: "Pac-Mon, multiplayer, blockchain, Monad, Web3, gaming, cryptocurrency",
  authors: [{ name: "Pac-Mon Arena Team" }],
};

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} antialiased h-full overflow-hidden`}>
        <div className="h-full w-full bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
          {children}
        </div>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            },
          }}
        />
      </body>
    </html>
  );
}
