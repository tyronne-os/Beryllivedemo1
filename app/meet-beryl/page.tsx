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
import CleoHero from "@/components/CleoHero";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Meet Beryl — The Live AI Presence Platform | Beryl Live",
  description: "The era of the chatbox is over. Beryl Live replaces text-only AI with real, photorealistic conversations — sub-180ms, premium, human.",
};

export default function MeetBerylPage() {
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
      <CleoHero />
      <Footer />
    </main>
  );
}
