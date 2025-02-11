import { Button } from "@/components/ui/button"
import Navbar from "./Components/Navbar/Navbar";
import Herosection from "./Components/HeroSection/Herosection";
import Footer from "./Components/Footer/Footer";

export default function Home() {
  return (
    <>
      <Navbar/>
      <Herosection/>
      <Footer/>
    </>
  );
}
