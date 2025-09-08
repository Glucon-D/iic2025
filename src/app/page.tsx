import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Hero } from "@/components/ui/homeSections/Hero";
import { Description } from "@/components/ui/homeSections/Description";
import { Features } from "@/components/ui/homeSections/Features";
import { Testimonials } from "@/components/ui/homeSections/Testimonials";
import { FAQs } from "@/components/ui/homeSections/FAQs";

export default function Home() {
  return (
    <div className="flex-1">
      <Navbar />
      <Hero />
      <Description />
      <Features />
      <Testimonials />
      <FAQs />
      <Footer />
    </div>
  );
}
