import "../globals.css";
import { Merriweather, Raleway } from "next/font/google";

const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  variable: "--font-merriweather",
});

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  variable: "--font-raleway",
});

// Components
import Navbar from "./components/Navbar"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${raleway.variable} ${merriweather.variable} antialiased`}>
      <Navbar />    
      {children}
    </div>
  );
}
