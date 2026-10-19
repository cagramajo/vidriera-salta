import { Footer, Header } from "./components/Chrome";
import { Hero } from "./components/Hero";
import { LeadForm } from "./components/LeadForm";
import { Neighbors } from "./components/Neighbors";
import { Pricing, Problem, Steps } from "./components/Sections";

export default function Home() {
  return (
    <div className="pagina">
      <Header />
      <main>
        <Hero />
        <Problem />
        <Steps />
        <Pricing />
        <Neighbors />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
}
