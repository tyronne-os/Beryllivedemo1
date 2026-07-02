import Nav from "@/components/Nav";
import HeroVideo from "@/components/HeroVideo";
import StatsBar from "@/components/StatsBar";
import DifferencePanel from "@/components/DifferencePanel";
import CliquePromo from "@/components/CliquePromo";
import KizzyBanner from "@/components/KizzyBanner";
import UseCases from "@/components/UseCases";
import ShowcaseBanners from "@/components/ShowcaseBanners";
import VoiceAgents from "@/components/VoiceAgents";
import Pricing from "@/components/Pricing";
import Manifesto from "@/components/Manifesto";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main>
      <Nav />
      <HeroVideo />
      <StatsBar />
      <DifferencePanel />
      <CliquePromo />
      <KizzyBanner />
      <UseCases />
      <ShowcaseBanners />
      <VoiceAgents />
      <div id="pricing"><Pricing /></div>
      <Manifesto />
      <Footer />
    </main>
  );
}
