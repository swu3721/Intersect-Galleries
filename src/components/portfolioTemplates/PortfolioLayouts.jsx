import ArtworkCard from '../ArtworkCard/ArtworkCard';
import CollectionCard from '../CollectionCard/CollectionCard';
import MasonryGrid from '../MasonryGrid/MasonryGrid';
import { normalizePortfolioTemplate } from '../../lib/portfolioTemplate';
import './PortfolioLayouts.css';

function effectiveCollections(user) {
  const raw = user?.collections;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw.filter((c) => (c.pieces?.length ?? c.pieceCount ?? 0) > 0);
  }
  return [];
}

export function PortfolioWorksSection({
  template,
  user,
  username,
  isOwner,
  /** (collection) => void | Promise — owner removes whole collection */
  onDeleteCollection,
  /** Legacy: (artwork) => void — flat works when no collections */
  onDeleteWork,
  previewMode = false,
  layoutRail = false,
}) {
  const artistName = user.name;
  const artworks = user.artworks ?? [];
  const collections = effectiveCollections(user);
  const useCollections = collections.length > 0;
  const tpl = normalizePortfolioTemplate(template || user.portfolio_template);

  const delCol = (col) =>
    onDeleteCollection
      ? () => {
          void onDeleteCollection(col);
        }
      : undefined;

  const delArt = (art) =>
    onDeleteWork
      ? () => {
          void onDeleteWork(art);
        }
      : undefined;

  const empty = (
    <p className="portfolio-layout__empty">
      Add collections from Edit portfolio to fill this layout.
    </p>
  );

  const legacyEmpty = (
    <p className="portfolio-layout__empty">
      Add works from Edit portfolio to fill this layout.
    </p>
  );

  if (layoutRail) {
    if (useCollections) {
      if (collections.length === 0) {
        return (
          <div className={`portfolio-works-rail portfolio-works-rail--empty portfolio-works-rail--${tpl}`}>
            {isOwner && empty}
          </div>
        );
      }
      return (
        <section
          className={`portfolio-works-rail portfolio-works-rail--${tpl}`}
          aria-label="Portfolio collections"
        >
          <div className="portfolio-works-rail__track">
            {collections.map((col) => (
              <div key={col.id} className="portfolio-works-rail__cell">
                <CollectionCard
                  collection={col}
                  username={username}
                  minimal={tpl === 'minimalist' || tpl === 'artsy'}
                  onDelete={delCol(col)}
                  previewMode={previewMode}
                />
              </div>
            ))}
          </div>
        </section>
      );
    }

    if (artworks.length === 0) {
      return (
        <div className={`portfolio-works-rail portfolio-works-rail--empty portfolio-works-rail--${tpl}`}>
          {isOwner && legacyEmpty}
        </div>
      );
    }
    return (
      <section
        className={`portfolio-works-rail portfolio-works-rail--${tpl}`}
        aria-label="Portfolio works"
      >
        <div className="portfolio-works-rail__track">
          {artworks.map((art) => (
            <div key={art.id} className="portfolio-works-rail__cell">
              <ArtworkCard
                artwork={art}
                artistName={artistName}
                username={username}
                minimal={tpl === 'minimalist' || tpl === 'artsy'}
                onDelete={delArt(art)}
                hideProfileLink={previewMode}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (tpl === 'artsy') {
    if (useCollections) {
      if (collections.length === 0) {
        return (
          <div className="portfolio-layout portfolio-layout--artsy-wrap">
            {isOwner && empty}
          </div>
        );
      }
      return (
        <div className="portfolio-layout portfolio-layout--artsy-wrap">
          <MasonryGrid className="portfolio-layout--artsy" gap="0.85rem" minColumnWidth={220}>
            {collections.map((col) => (
              <CollectionCard
                key={col.id}
                collection={col}
                username={username}
                minimal
                onDelete={delCol(col)}
                previewMode={previewMode}
              />
            ))}
          </MasonryGrid>
        </div>
      );
    }
    if (artworks.length === 0) {
      return (
        <div className="portfolio-layout portfolio-layout--artsy-wrap">
          {isOwner && legacyEmpty}
        </div>
      );
    }
    return (
      <div className="portfolio-layout portfolio-layout--artsy-wrap">
        <MasonryGrid className="portfolio-layout--artsy" gap="0.85rem" minColumnWidth={220}>
          {artworks.map((art) => (
            <ArtworkCard
              key={art.id}
              artwork={art}
              artistName={artistName}
              username={username}
              minimal
              onDelete={delArt(art)}
              hideProfileLink={previewMode}
            />
          ))}
        </MasonryGrid>
      </div>
    );
  }

  if (tpl === 'bold') {
    if (useCollections) {
      if (collections.length === 0) {
        return (
          <div className="portfolio-layout portfolio-layout--bold">
            <h2 className="portfolio-bold-pdf-heading">
              <span className="portfolio-bold-pdf-heading__line">NAME OF EXHIBITION /</span>
              <span className="portfolio-bold-pdf-heading__line">COLLECTIONS</span>
            </h2>
            <div className="portfolio-layout__bold-accent" aria-hidden />
            {isOwner && empty}
          </div>
        );
      }
      const [first, ...rest] = collections;
      return (
        <div className="portfolio-layout portfolio-layout--bold">
          <h2 className="portfolio-bold-pdf-heading">
            <span className="portfolio-bold-pdf-heading__line">NAME OF EXHIBITION /</span>
            <span className="portfolio-bold-pdf-heading__line">COLLECTIONS</span>
          </h2>
          <div className="portfolio-layout__bold-accent" aria-hidden />
          <div className="portfolio-layout__bold-hero">
            <CollectionCard
              collection={first}
              username={username}
              onDelete={delCol(first)}
              previewMode={previewMode}
            />
          </div>
          {rest.length > 0 && (
            <MasonryGrid className="portfolio-layout__bold-grid" gap="1rem" minColumnWidth={180}>
              {rest.map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  username={username}
                  onDelete={delCol(col)}
                  previewMode={previewMode}
                />
              ))}
            </MasonryGrid>
          )}
        </div>
      );
    }
    if (artworks.length === 0) {
      return (
        <div className="portfolio-layout portfolio-layout--bold">
          <h2 className="portfolio-bold-pdf-heading">
            <span className="portfolio-bold-pdf-heading__line">NAME OF EXHIBITION /</span>
            <span className="portfolio-bold-pdf-heading__line">COLLECTIONS</span>
          </h2>
          <div className="portfolio-layout__bold-accent" aria-hidden />
          {isOwner && legacyEmpty}
        </div>
      );
    }
    const [first, ...rest] = artworks;
    return (
      <div className="portfolio-layout portfolio-layout--bold">
        <h2 className="portfolio-bold-pdf-heading">
          <span className="portfolio-bold-pdf-heading__line">NAME OF EXHIBITION /</span>
          <span className="portfolio-bold-pdf-heading__line">COLLECTIONS</span>
        </h2>
        <div className="portfolio-layout__bold-accent" aria-hidden />
        <div className="portfolio-layout__bold-hero">
          <ArtworkCard
            artwork={first}
            artistName={artistName}
            username={username}
            onDelete={delArt(first)}
            hideProfileLink={previewMode}
          />
        </div>
        {rest.length > 0 && (
          <MasonryGrid className="portfolio-layout__bold-grid" gap="1rem" minColumnWidth={180}>
            {rest.map((art) => (
              <ArtworkCard
                key={art.id}
                artwork={art}
                artistName={artistName}
                username={username}
                onDelete={delArt(art)}
                hideProfileLink={previewMode}
              />
            ))}
          </MasonryGrid>
        )}
      </div>
    );
  }

  /* minimalist */
  if (tpl === 'minimalist') {
    if (useCollections) {
      if (collections.length === 0) {
        return (
          <div className="portfolio-layout portfolio-layout--minimalist">
            {isOwner && empty}
          </div>
        );
      }
      const [lead, ...rest] = collections;
      return (
        <div className="portfolio-layout portfolio-layout--minimalist">
          <header className="portfolio-minimal-heading">
            <span className="portfolio-minimal-heading__eyebrow">Portfolio</span>
            <h2 className="portfolio-minimal-heading__title">Collections</h2>
          </header>
          <div className="portfolio-layout__minimal-lead">
            <CollectionCard
              collection={lead}
              username={username}
              minimal
              onDelete={delCol(lead)}
              previewMode={previewMode}
            />
          </div>
          {rest.length > 0 && (
            <MasonryGrid className="portfolio-layout__minimal-grid" gap="1.75rem" minColumnWidth={260}>
              {rest.map((col) => (
                <CollectionCard
                  key={col.id}
                  collection={col}
                  username={username}
                  minimal
                  onDelete={delCol(col)}
                  previewMode={previewMode}
                />
              ))}
            </MasonryGrid>
          )}
        </div>
      );
    }
    if (artworks.length === 0) {
      return (
        <div className="portfolio-layout portfolio-layout--minimalist">
          {isOwner && legacyEmpty}
        </div>
      );
    }
    const [lead, ...rest] = artworks;
    return (
      <div className="portfolio-layout portfolio-layout--minimalist">
        <header className="portfolio-minimal-heading">
          <span className="portfolio-minimal-heading__eyebrow">Works</span>
          <h2 className="portfolio-minimal-heading__title">Selected pieces</h2>
        </header>
        <div className="portfolio-layout__minimal-lead">
          <ArtworkCard
            artwork={lead}
            artistName={artistName}
            username={username}
            minimal
            onDelete={delArt(lead)}
            hideProfileLink={previewMode}
          />
        </div>
        {rest.length > 0 && (
          <MasonryGrid className="portfolio-layout__minimal-grid" gap="1.75rem" minColumnWidth={260}>
            {rest.map((art) => (
              <ArtworkCard
                key={art.id}
                artwork={art}
                artistName={artistName}
                username={username}
                minimal
                onDelete={delArt(art)}
                hideProfileLink={previewMode}
              />
            ))}
          </MasonryGrid>
        )}
      </div>
    );
  }

  return (
    <div className="portfolio-layout portfolio-layout--minimalist">
      {useCollections
        ? collections.map((col) => (
            <CollectionCard
              key={col.id}
              collection={col}
              username={username}
              onDelete={delCol(col)}
              previewMode={previewMode}
            />
          ))
        : artworks.map((art) => (
            <ArtworkCard
              key={art.id}
              artwork={art}
              artistName={artistName}
              username={username}
              onDelete={delArt(art)}
              hideProfileLink={previewMode}
            />
          ))}
      {isOwner
        && (useCollections ? collections.length === 0 : artworks.length === 0)
        && (useCollections ? empty : legacyEmpty)}
    </div>
  );
}
