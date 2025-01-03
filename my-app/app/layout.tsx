import type { Metadata } from "next";
import { DM_Sans, DM_Mono } from "next/font/google";
import { FirebaseProvider } from '../contexts/FirebaseContext';
import "./globals.css";
import { AuthProvider } from '../contexts/AuthContext';


// Importing DM Sans and DM Mono with specified weights
const dmSans = DM_Sans({
  variable: "--font-dm-sans",   // Custom variable name for DM Sans
  subsets: ["latin"],           // Subset of the font
  weight: ["300", "400", "500", "600", "700"],  // Specific font weights for DM Sans
});

const dmMono = DM_Mono({
  variable: "--font-dm-mono",   // Custom variable name for DM Mono
  subsets: ["latin"],           // Subset of the font
  weight: ["300", "400", "500"], // Specific font weights for DM Mono
});

export const metadata: Metadata = {
  title: "Nab App",
  description: "Smarter secondhand shopping",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${dmSans.variable} ${dmMono.variable}`}>
      <body>

        <FirebaseProvider>
          <AuthProvider>
            {children}

          </AuthProvider>
          
        </FirebaseProvider>
      </body>
    </html>
  );
}
