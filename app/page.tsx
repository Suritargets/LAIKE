import Nav from "@/components/Nav";
import HeroDemo from "@/components/HeroDemo";
import StatsBar from "@/components/StatsBar";
import Features from "@/components/Features";
import Pipeline from "@/components/Pipeline";
import Formats from "@/components/Formats";
import InterfacePreview from "@/components/InterfacePreview";
import Roadmap from "@/components/Roadmap";
import Donate from "@/components/Donate";
import Contribute from "@/components/Contribute";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <HeroDemo />
      <StatsBar />
      <Features />
      <Pipeline />
      <Formats />
      <InterfacePreview />
      <Roadmap />
      <Donate />
      <Contribute />
      <CTA />
      <Footer />
    </>
  );
}
