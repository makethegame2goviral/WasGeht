# WasGeht

**Deine Chats. Deine Welt.** A green-and-white, responsive messenger prototype.

## Included in this first connected version

- Username + password sign-in (internally mapped to a non-deliverable alias; no email address is collected).
- Profiles, username search, online/offline indicator, contact requests and blocking.
- Private one-to-one chats and public/private groups.
- Group join requests, member acceptance, group history, member-editable group details.
- Text messages, image/video/audio file attachments, edit/delete own messages, reactions and read receipts.
- 24-hour text statuses.
- Admin view for accounts and groups; admins can inspect group messages only. Direct/private chats are excluded by database RLS.
- Installable PWA shell and responsive layout.
- Basic browser-to-browser WebRTC call prototype for voice/video (requires microphone/camera permission and may not connect on every network without a TURN relay).

## Backend

This repository uses the existing Supabase project **Size** with isolated wg_ tables and a private wg-media storage bucket. It does not modify Size or Zynx tables.

Project URL: https://puddgzxqekteblmlpiqv.supabase.co

The browser uses only the Supabase publishable key. Never put a Supabase service-role/secret key in this repository.

## One-time Supabase Auth setting

Username-only sign-in is implemented by mapping each username to an internal alias of the form username@login.wasgeht.invalid. This alias cannot receive email. In Supabase Dashboard, open **Authentication → Providers → Email** and turn **Confirm email** off before public registration. Users cannot reset a forgotten password through email; they would need a separate recovery process.

## Set up the WasGeht admin

1. Register the account with username exactly **WasGehtAdminYusuf** and choose your own password.
2. In Supabase Dashboard → SQL Editor, run:

    insert into public.wg_admins(user_id)
    select user_id
    from public.wg_profiles
    where lower(username) = lower('WasGehtAdminYusuf')
    on conflict do nothing;

3. Sign out and back in. The Admin tab will appear.

Admin capabilities are limited by database policies. Admins can manage profile names and bans and read group conversations. They cannot read private one-to-one chats. Account deletion is not wired to the client because it requires a protected server-side Auth Admin operation.

## Publish with Cloudflare Pages

The site is a static app in the repository root:
- Build command: leave empty
- Build output directory: / (or . if the dashboard requires a relative directory)
- Production branch: main

Connect the GitHub repository makethegame2goviral/WasGeht to a Cloudflare Pages project named wasgeht. Cloudflare will provide a *.pages.dev URL. Each push to main can redeploy the site.

## Current limitations (not yet production-complete)

- Browser notifications work while the site is open. True background push requires VAPID keys and a protected push-sending service.
- Voice/video calling is a basic WebRTC prototype using a public STUN server; reliable calling across all networks needs a TURN relay.
- Voice messages can be attached as audio files; an in-app press-to-record voice-message control is still to be added.
- Status media, avatar uploads, sticker/GIF library, forwarding, pinned messages, chat archive/mute, and robust account deletion are not yet implemented.
- This is an early prototype. Test with a few trusted people before sharing widely; the free hosting/database tiers have usage limits and can pause inactive projects.
