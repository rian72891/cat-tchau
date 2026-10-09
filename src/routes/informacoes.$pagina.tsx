import { createFileRoute, notFound } from '@tanstack/react-router';
import { informationPages } from '@/lib/information-pages';

export const Route = createFileRoute('/informacoes/$pagina')({
  beforeLoad: ({ params }) => { if (!informationPages[params.pagina]) throw notFound(); },
  head: ({ params }) => {
    const page = informationPages[params.pagina];
    const title = `${page?.title ?? 'Informações'} | Catchau`;
    const description = page?.description ?? 'Informações da Catchau.';
    const url = `https://cat-tchau.lovable.app/informacoes/${encodeURIComponent(params.pagina)}`;
    return {
      meta: [{ title }, { name: 'description', content: description }, { property: 'og:title', content: title }, { property: 'og:description', content: description }, { property: 'og:type', content: 'website' }, { property: 'og:url', content: url }, { name: 'twitter:card', content: 'summary_large_image' }],
      links: [{ rel: 'canonical', href: url }],
    };
  },
  component: InformationPage,
});

function InformationPage() {
  const { pagina } = Route.useParams();
  return <iframe className="block h-dvh w-full border-0 bg-background" src={`/catchau/index.html?page=${encodeURIComponent(pagina)}`} title={`${informationPages[pagina]?.title ?? 'Informações'} — Catchau`} />;
}