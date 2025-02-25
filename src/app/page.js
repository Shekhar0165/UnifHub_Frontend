"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Herosection from "./Components/HeroSection/Herosection";
import Footer from "./Components/Footer/Footer";

export default function Home() {
  const router = useRouter();
  // hello 

  useEffect(() => {
    // Check for token and redirect within useEffect (client-side only)
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.replace("/events");
    }
  }, [router]);
  // hello

  return (
    <>
      <Navbar />
      <Herosection />
      <Footer />
    </>
  );
}