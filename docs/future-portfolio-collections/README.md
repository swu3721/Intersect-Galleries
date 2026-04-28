# Portfolio collections (deferred)

This folder holds the **collections + soundtrack + fullscreen swipe viewer** work so you can turn it on later without hunting git history.

## What ships in the app today

The main codebase uses the **original schema**: flat `portfolio_items` only (no `portfolio_collections` table, no `collection_id` column required by the client).

## When you want to enable it

1. **Database**  
   Copy `20260427140000_portfolio_collections.sql` into `supabase/migrations/` (same filename is fine), then apply it to your Supabase project (`supabase db push` or paste the SQL in the Dashboard SQL editor).

2. **App source**  
   Replace or merge files from `src-archive/` into `src/` (paths shown below). Restore the `CollectionView` route in `App.jsx` as in `App.collections.jsx`.

| Restore into | From archive |
|--------------|----------------|
| `src/lib/supabaseProfiles.js` | `supabaseProfiles.collections.js` |
| `src/components/portfolioTemplates/PortfolioLayouts.jsx` | `PortfolioLayouts.collections.jsx` |
| `src/pages/Profile.jsx` | `Profile.collections.jsx` |
| `src/pages/Onboarding.jsx` | `Onboarding.collections.jsx` |
| `src/data/onboardingPreviewSamples.js` | `onboardingPreviewSamples.collections.js` |
| `src/App.jsx` | `App.collections.jsx` |
| `src/pages/CollectionView.jsx` + `.css` | same names in archive |
| `src/components/CollectionCard/` | `CollectionCard/` folder |

3. **CSS**  
   Merge `src-archive/PortfolioLayouts.collections.extra.css` into `src/components/portfolioTemplates/PortfolioLayouts.css`.

4. **Onboarding.css**  
   Restore the `.collections-editor` / `.collection-block` rules from `Onboarding.collections.jsx` era (see git history) or rebuild from that step’s layout.

**If your Supabase DB was already migrated** (has `portfolio_collections` / `collection_id` NOT NULL): flat `portfolio_items` inserts from this old client may fail until you either roll back the DB migration or switch back to the archived frontend.

**Order of operations:** apply the SQL migration first (or in the same release as the new client), then deploy the restored frontend, so PostgREST always finds `portfolio_collections` when the new code queries it.
