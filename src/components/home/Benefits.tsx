import { BadgeCheck, Headphones, ShieldCheck, Wallet } from "lucide-react";
import { Container } from "../layout/Container.tsx";

const benefits = [
  {
    icon: ShieldCheck,
    title: "Compra segura",
    description: "Seus dados tratados com cuidado em cada etapa.",
  },
  {
    icon: Wallet,
    title: "Pagamento facilitado",
    description: "Flexibilidade para escolher. Parcele em até 6x sem juros.",
  },
  {
    icon: BadgeCheck,
    title: "Produtos selecionados",
    description: "Uma curadoria enxuta, sem excesso de opções.",
  },
  {
    icon: Headphones,
    title: "Atendimento dedicado",
    description: "Suporte humano para ajudar na sua escolha.",
  },
];

export function Benefits() {
  return (
    <section className="py-6 sm:py-8" aria-label="Diferenciais">
      <Container>
        <ul className="grid gap-6 rounded-3xl border border-line bg-paper px-6 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <li key={benefit.title} className="flex gap-3">
              <benefit.icon aria-hidden="true" className="mt-0.5 shrink-0 text-brand" size={18} />
              <div>
                <h3 className="text-sm font-semibold text-ink">{benefit.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{benefit.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
