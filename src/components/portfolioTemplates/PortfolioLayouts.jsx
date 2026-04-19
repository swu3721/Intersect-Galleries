import ArtworkCard from '../ArtworkCard/ArtworkCard';
import './PortfolioLayouts.css';

export function PortfolioWorksSection({ template, user, username, isOwner }) {
  const artistName = user.name;
  const artworks = user.artworks ?? [];
  const tpl = template || user.portfolio_template || 'grid';

  if (tpl === 'masonry') {
    return (
      <div className="portfolio-layout portfolio-layout--masonry">
        {artworks.map((art) => (
          <div key={art.id} className="portfolio-layout__masonry-item">
            <ArtworkCard artwork={art} artistName={artistName} username={username} />
          </div>
        ))}
        {isOwner && artworks.length === 0 && (
          <p className="portfolio-layout__empty">Add works from Edit portfolio to fill this layout.</p>
        )}
      </div>
    );
  }

  if (tpl === 'spotlight' && artworks.length === 0) {
    return (
      <div className="portfolio-layout portfolio-layout--grid">
        {isOwner && (
          <p className="portfolio-layout__empty">Add works from Edit portfolio to fill this layout.</p>
        )}
      </div>
    );
  }

  if (tpl === 'spotlight') {
    const [first, ...rest] = artworks;
    return (
      <div className="portfolio-layout portfolio-layout--spotlight">
        <div className="portfolio-layout__spotlight-hero">
          <ArtworkCard artwork={first} artistName={artistName} username={username} />
        </div>
        {rest.length > 0 && (
          <div className="portfolio-layout__spotlight-grid">
            {rest.map((art) => (
              <ArtworkCard key={art.id} artwork={art} artistName={artistName} username={username} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="portfolio-layout portfolio-layout--grid">
      {artworks.map((art) => (
        <ArtworkCard key={art.id} artwork={art} artistName={artistName} username={username} />
      ))}
      {isOwner && artworks.length === 0 && (
        <p className="portfolio-layout__empty">Add works from Edit portfolio to fill this layout.</p>
      )}
    </div>
  );
}
