import Nav from "@/components/Nav";
import CliqueRoom from "@/components/clique/CliqueRoom";
import AccessGate from "@/components/AccessGate";

export const metadata = { title: "Beryl Clique — Your AI Team Room" };

export default function CliquePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#FDFAF6" }}>
      <AccessGate />
      <Nav />
      <CliqueRoom />
    </main>
  );
}
