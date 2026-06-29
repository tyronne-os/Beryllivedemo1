import Nav from "@/components/Nav";
import CliqueLandingPage from "@/components/CliqueLandingPage";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Beryl Clique — The World's First AI Clique",
  description: "Not a chatbot. Not an assistant. A live room of AI agents who know your name, remember your wins, and get real work done — together.",
};

export default function CliquePromoPage() {
  return (
    <>
      <Nav />
      <CliqueLandingPage />
      <Footer />
    </>
  );
}
