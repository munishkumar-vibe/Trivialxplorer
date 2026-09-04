import { getHikingImages } from "@/lib/images";
import Navbar from "@/components/Navbar/Navbar";
import Hero from "@/components/Hero/Hero";
import ImageCarousel from "@/components/ImageCarousel/ImageCarousel";
import About from "@/components/About/About";
import Features from "@/components/Features/Features";
import TrekGallery from "@/components/TrekGallery/TrekGallery";
import Footer from "@/components/Footer/Footer";

export default function Page() {
  const images = getHikingImages();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ImageCarousel images={images} />
        <About />
        <Features />
        <TrekGallery />
      </main>
      <Footer />
    </>
  );
}
