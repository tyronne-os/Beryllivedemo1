import Nav from "@/components/Nav";
import CliqueFlagship from "@/components/CliqueFlagship";
import Footer from "@/components/Footer";

export const metadata = {
  title: "The Clique — Video Chat With Your AI Agents | Beryl Live",
  description: "The end of coding AI agents. The world's first agent video chat — open the room, call them by name, and host a live meeting with your AI team.",
};

export default function CliquePromoPage() {
  return (
    <>
      <Nav />
      <CliqueFlagship />
      <Footer />
    </>
  );
}
