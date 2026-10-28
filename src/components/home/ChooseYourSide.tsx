import sideAmd from "../../assets/catalog/side-amd.jpg";
import sideNvidia from "../../assets/catalog/side-nvidia.jpg";
import { Container } from "../layout/Container.tsx";

const sides = [
  {
    id: "amd",
    name: "AMD",
    line: "Radeon",
    image: sideAmd,
    alt: "Placa de vídeo com iluminação vermelha",
    wash: "from-red-950/80",
  },
  {
    id: "nvidia",
    name: "NVIDIA",
    line: "GeForce",
    image: sideNvidia,
    alt: "Placa de vídeo com iluminação verde",
    wash: "from-emerald-950/80",
  },
] as const;

export function ChooseYourSide() {
  return (
    <section className="pt-6 pb-12 sm:pt-8 sm:pb-16 lg:pt-10" aria-labelledby="titulo-lados">
      <Container>
        <div className="text-center">
          <h2
            id="titulo-lados"
            className="font-serif text-3xl font-medium tracking-[-0.03em] text-ink sm:text-4xl"
          >
            Choose your side.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
            Radeon de um lado. GeForce do outro.
          </p>
        </div>
        <ul className="mt-8 grid gap-4 md:grid-cols-2">
          {sides.map((side) => (
            <li key={side.id}>
              <article className="group relative overflow-hidden rounded-2xl border border-line bg-paper transition duration-300 hover:border-ink/30 motion-reduce:transition-none">
                <img
                  src={side.image}
                  alt={side.alt}
                  className="aspect-[16/9] w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
                <div
                  aria-hidden="true"
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-t ${side.wash} via-transparent to-transparent`}
                />
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-white/75 uppercase">
                    {side.line}
                  </p>
                  <p className="font-serif text-3xl leading-none font-medium tracking-[-0.03em] text-white">
                    {side.name}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
