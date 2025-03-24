"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Navbar from "./Components/Navbar/Navbar";
import Herosection from "./Components/HeroSection/Herosection";
import Footer from "./Components/Footer/Footer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// This prevents this page from being pre-rendered statically
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Ensure we only run client-side code after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Only run after component is mounted on client
    if (!isMounted) return;
    
    // Check for token and redirect within useEffect (client-side only)
    const checkAuthAndRedirect = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const UserType = localStorage.getItem("UserType");
        const UserID = localStorage.getItem("UserId");
        
        if (token && UserType === "individual") {
          await router.replace(`/events`);
        } else if (token && UserType === "Organization") {
          await router.replace(`/organization/${UserID}`);
        } 
      } catch (error) {
        console.error("Navigation error:", error);
        // Set loading to false if navigation fails
        setLoading(false);
      }
    };
    
    checkAuthAndRedirect();
    
    // Fallback timeout in case navigation gets stuck
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [router, isMounted]);

  if (!isMounted || loading) {
    return <LoadingSpinner text="Preparing your experience..." />;
  }

  return (
    <>
      <Navbar />
      <Herosection />
      <Footer />
    </>
  );
}