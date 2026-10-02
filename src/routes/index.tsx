import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Catchau | Hardware e PCs gamer" },
      {
        name: "description",
        content:
          "Hardware, PCs gamer e periféricos com ofertas no PIX e parcelamento em até 12 vezes.",
      },
      { property: "og:title", content: "Catchau | Hardware e PCs gamer" },
      {
        property: "og:description",
        content:
          "Hardware, PCs gamer e periféricos com ofertas no PIX e parcelamento em até 12 vezes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <iframe
      className="block h-dvh w-full border-0 bg-background"
      src="/catchau/index.html"
      title="Catchau"
    />
  );
}