import Nav from "@/components/Nav";
import CliqueRoom from "@/components/clique/CliqueRoom";

export const metadata = { title: "Beryl Clique — Your AI Team Room" };

export default function CliquePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#FDFAF6" }}>
      <Nav />
      <CliqueRoom />
    </main>
  );
}
