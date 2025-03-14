import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "./Footer";
import Image from "next/image";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Spatial Audio Experiment",
  description: " This is an experimental website for spatial audio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex items-center space-x-1 m-3">
          <Image
            src="/logo.png"
            alt="logo"
            width={50}
            height={50}
            className="m-3"
          />
          <p className="text-xl font-bold text-slate-300">Ghost Zen</p>
          <p className="text-xl font-bold text-slate-500">
            {" "}
            | Spatial Audio Experiment
          </p>
        </div>
        <main className="p-10 min-h-screen"> {children}</main>
        <Footer />
      </body>
    </html>
  );
}
