import type { Metadata } from 'next';
//import { Inter } from "next/font/google";
import { montserrat } from '@/styles/fonts';
import '../styles/globals.css';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/header/Header/Header';

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.className} antialiased`}>
        <Header/>
        <main className="container min-h-screen ">
          {children}
        </main>
        <div id="modal-container" />
      </body>
    </html>
  );
}
