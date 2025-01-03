// import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import './fonts.css'  // Add this line

export const metadata = {
  title: 'Hello Session',
  description: 'A question generator for meaningful conversations',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}