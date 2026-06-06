// The collections index — the full set of Omakase's lines as hairline-separated
// rows (glyph · name · tagline · →). Server Component reading the data-layer.

import { getCollections } from "@/lib/data-layer";
import { CollectionRow } from "@/components/store/collection-row";

export default function CollectionsIndex() {
  const collections = getCollections();

  return (
    <div className="bg-paper">
      <section className="mx-auto max-w-7xl px-6 pb-12 pt-24 sm:px-10 sm:pb-16 sm:pt-32">
        <p className="label label-muted">Omakase · お任せ</p>
        <h1 className="display mt-6 text-5xl text-ink sm:text-7xl">
          The Collections
        </h1>
        <p className="serif mt-6 max-w-xl text-xl text-ink-muted">
          Six collections, each with its own character. The chef&rsquo;s
          selection — edited down to what lasts.
        </p>
      </section>

      <section className="mx-auto max-w-7xl border-b border-hairline sm:px-10">
        {collections.map((collection, i) => (
          <CollectionRow
            key={collection.slug}
            collection={collection}
            index={i + 1}
          />
        ))}
      </section>

      <div className="h-24 sm:h-32" />
    </div>
  );
}
