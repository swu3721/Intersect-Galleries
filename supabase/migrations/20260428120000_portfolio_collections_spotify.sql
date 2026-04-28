-- Optional Spotify track (embed) per portfolio collection
alter table public.portfolio_collections
  add column if not exists spotify_track_id text;

comment on column public.portfolio_collections.spotify_track_id is
  'Spotify track ID (22-char) for embed player; set from onboarding or profile.';
