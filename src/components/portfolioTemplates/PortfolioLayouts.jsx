import ArtworkCard from '../ArtworkCard/ArtworkCard';
import MasonryGrid from '../MasonryGrid/MasonryGrid';
import { normalizePortfolioTemplate } from '../../lib/portfolioTemplate';
import './PortfolioLayouts.css';

export function PortfolioWorksSection({
  template,
  user,
  username,
  isOwner,
  /** (artwork) => void | Promise — e.g. owner deletes from Supabase */
  onDeleteWork,
  /** Onboarding / demos: no profile links on cards */
  previewMode = false,
  /** Profile page: horizontal scrolling strip */
  layoutRail = false,
}) {
  const artistName = user.name;
  const artworks = user.artworks ?? [];
  const tpl = normalizePortfolioTemplate(template || user.portfolio_template);

  const del = (art) =>
    onDeleteWork
      ? () => {
          void onDeleteWork(art);
        }
      : undefined;

  const empty = (
    <p className="portfolio-layout__empty">
      Add works from Edit portfolio to fill this layout.
    </p>
  );

  if (layoutRail) {
    if (artworks.length === 0) {
      return (
        <div className={`portfolio-works-rail portfolio-works-rail--empty portfolio-works-rail--${tpl}`}>
          {isOwner && empty}
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
                onDelete={del(art)}
                hideProfileLink={previewMode}
              />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (tpl === 'artsy') {
    if (artworks.length === 0) {
      return (
        <div className="portfolio-layout portfolio-layout--artsy-wrap">
          {isOwner && empty}
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
              onDelete={del(art)}
              hideProfileLink={previewMode}
            />
          ))}
        </MasonryGrid>
      </div>
    );
  }

  if (tpl === 'bold') {
    if (artworks.length === 0) {
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
            onDelete={del(first)}
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
                onDelete={del(art)}
                hideProfileLink={previewMode}
              />
            ))}
          </MasonryGrid>
        )}
      </div>
    );
  }

  /* minimalist — aligned with intersect_galleries Figma demo (Maya Chen) */
  if (tpl === 'minimalist') {
    if (artworks.length === 0) {
      return (
        <div className="portfolio-layout portfolio-layout--minimalist">
          {isOwner && empty}
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
            onDelete={del(lead)}
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
                onDelete={del(art)}
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
      {artworks.map((art) => (
        <ArtworkCard
          key={art.id}
          artwork={art}
          artistName={artistName}
          username={username}
          onDelete={del(art)}
          hideProfileLink={previewMode}
        />
      ))}
      {isOwner && artworks.length === 0 && empty}
    </div>
  );
}
