import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { hardwareCategories } from "../../data/catalog.ts";
import { api, type ApiClient } from "../../lib/http/client.ts";
import type { CatalogRef } from "../../lib/catalog/catalog.ts";
import { openCatalogAtTop } from "../../lib/navigation/openCatalogAtTop.ts";
import { Container } from "../layout/Container.tsx";
import { categoryIdForName } from "./categoryLink.ts";

function cardClassName(index: number) {
  const isLast = index === hardwareCategories.length - 1;
  const startsSecondRow = index === 4;

  return [
    "lg:col-span-2",
    startsSecondRow ? "lg:col-start-2" : "",
    isLast
      ? "col-span-2 w-[calc(50%-0.5rem)] justify-self-center sm:w-[calc(50%-0.625rem)] lg:w-auto lg:justify-self-stretch"
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

type CategorySectionProps = {
  client?: ApiClient;
};

export function CategorySection({ client = api }: CategorySectionProps) {
  const [categories, setCategories] = useState<CatalogRef[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    client
      .get<CatalogRef[]>("/api/v1/categorias", { signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) {
          setCategories(Array.isArray(items) ? items : []);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setCategories([]);
        }
      });

    return () => controller.abort();
  }, [client]);

  return (
    <section id="categorias" className="scroll-mt-24 bg-band py-12 sm:py-16" aria-labelledby="titulo-categorias">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-brand uppercase">
              <span className="h-px w-8 bg-brand" />
              Navegue
            </p>
            <h2
              id="titulo-categorias"
              className="mt-4 font-serif text-4xl font-medium tracking-[-0.03em] text-ink sm:text-5xl"
            >
              Explore por categoria
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-relaxed text-muted lg:block">
            Sete peças. Uma máquina.
            <br />
            Escolha por onde começar.
          </p>
        </div>
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-8">
          {hardwareCategories.map((category, index) => {
            const categoryId = categoryIdForName(category.name, categories);
            const content = (
              <>
                <div className="group overflow-hidden rounded-2xl border border-line transition duration-300 hover:border-ink/30 motion-reduce:transition-none">
                  <img
                    src={category.image}
                    alt=""
                    className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                </div>
                <h3 className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                  {category.name}
                  <ArrowUpRight aria-hidden="true" size={14} />
                </h3>
                <p className="mt-0.5 text-sm text-muted">{category.description}</p>
              </>
            );

            return (
              <li key={category.id} className={cardClassName(index)}>
                {categoryId === undefined ? (
                  <article className="h-full">{content}</article>
                ) : (
                  <Link
                    to={`/produtos?categoria=${categoryId}`}
                    state={openCatalogAtTop}
                    className="block h-full cursor-pointer"
                  >
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
