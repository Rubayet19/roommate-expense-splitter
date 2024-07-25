import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from './GoogleOAuthProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Roommate Expense Splitter",
  description: "A simple and easy-to-use application that helps you manage your shared living expenses.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <GoogleOAuthProvider>
        <body className={`${inter.className} p-4`}>{children}</body>
      </GoogleOAuthProvider>
    </html>
  );
}