import Nav from "@/components/Nav";
import HeroVideo from "@/components/HeroVideo";
import StatsBar from "@/components/StatsBar";
import DifferencePanel from "@/components/DifferencePanel";
import SquadScroller from "@/components/SquadScroller";
import KizzyBanner from "@/components/KizzyBanner";
import MatineeBanner from "@/components/MatineeBanner";
import UseCases from "@/components/UseCases";
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
      <div id="clique"><SquadScroller /></div>
      <KizzyBanner />
      <MatineeBanner />
      <UseCases />
      <VoiceAgents />
      <div id="pricing"><Pricing /></div>
      <Manifesto />
      <Footer />
    </main>
  );
}
