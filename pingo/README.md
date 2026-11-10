# PINGO — Your people. Your place.

A dark-first social app concept combining private chats, groups, short-lived Moments and communities.

## Current prototype

This folder contains the first responsive frontend prototype:
- Desktop and mobile dark interface
- Navigation: Messages, Moments, Groups, Discover, Settings
- Sample conversations and local-only message sending
- Feed composer and demo reactions

**Not connected yet:** real accounts, database, realtime messaging, media upload, push notifications or calls. Sample people and messages are fictional demo content.

## Planned architecture

- Supabase Auth for accounts
- Supabase Postgres + Row Level Security for profiles, conversations, memberships, messages and posts
- Supabase Realtime for message delivery and presence
- Private Supabase Storage buckets for user media
- Cloudflare Worker or Supabase Edge Functions for protected server-side tasks
- Web Push with VAPID keys and a protected sender, tested on real devices and browsers

## Security principles

- Never expose service-role keys, VAPID private keys or other secrets in frontend code.
- Enforce chat membership, group permissions and admin permissions in database policies/server-side functions.
- Validate uploads and enforce file size/type limits.
- Never auto-join calls or activate microphone/camera without an explicit user action.
- Keep profiles and social posts private by default until users choose visibility.

## Run

Open `index.html` from this folder or serve the folder using a local static server. Google Fonts load from Google Fonts when online; system fallbacks are available.

## Roadmap

1. Refine the UI and test desktop/mobile layouts.
2. Add authentication and profile setup.
3. Implement private chats, groups and reliable realtime delivery.
4. Implement and test real background push notifications.
5. Add Moments, feed, comments, reactions and privacy controls.
6. Add secure media uploads and moderation.
7. Add calls only after messaging is stable.
