"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Herosection from "./Components/HeroSection/Herosection";
import Footer from "./Components/Footer/Footer";

export default function Home() {  // Removed `request`
  const router = useRouter();

  useEffect(() => {
    // Extract token from document.cookie
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? match[2] : null;
    };

    const tokenValue = getCookie("accessToken");
    if (tokenValue) {
      router.replace("/events");
    }
  }, [router]);

  return (
    <>
      <Navbar />
      <Herosection />
      <Footer />
    </>
  );
}
