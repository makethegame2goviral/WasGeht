# WasGeht

**Deine Chats. Deine Welt.** A responsive green-and-white messenger prototype.

## Implemented

- Username + password registration and login (username is mapped internally to a non-deliverable alias; no real email is collected).
- Profiles with username, bio, status text and profile picture upload.
- Username search, contact requests, accept/decline, block and unblock.
- Private one-to-one chats and public/private groups.
- Public-group join requests; a current group member can accept a request.
- Group creators are owners; group members can edit group name, picture and description.
- Existing group history is visible to newly accepted members.
- Text messages, image/video/audio attachments, in-app voice recording, replies, reactions, edit/delete own messages.
- Read receipts are written when a recipient opens a conversation; the UI shows sent/read state.
- Text, image and video status posts that expire after 24 hours.
- Admin dashboard for accounts and groups. Admins can rename/ban accounts, join groups and inspect group messages. Direct/private chats are excluded by database RLS.
- Installable PWA shell and responsive layout for phones, tablets and desktops.
- Basic WebRTC voice/video call prototype.

## Backend

This app uses the existing Supabase project **Size**, with isolated `wg_` tables and the private `wg-media` storage bucket. The Size/Zynx tables are not changed by WasGeht migrations.

Project URL: https://puddgzxqekteblmlpiqv.supabase.co

The browser uses only the Supabase publishable key. Never put a Supabase service-role/secret key in this repository.

## Required Supabase Auth setting

Username-only sign-in is implemented by mapping a username to an internal alias like `username@login.wasgeht.invalid`. In Supabase Dashboard, open **Authentication → Providers → Email** and turn **Confirm email** off before registration. Users do not provide a real email address, so email-based password recovery is not available. A forgotten password currently means the account cannot self-recover.

## Set up the WasGeht admin

1. Register with the exact username **WasGehtAdminYusuf** and choose your own password.
2. In Supabase Dashboard → SQL Editor, run:

   ```sql
   insert into public.wg_admins(user_id)
   select user_id
   from public.wg_profiles
   where lower(username) = lower('WasGehtAdminYusuf')
   on conflict do nothing;
   ```

3. Sign out and back in. The Admin tab will appear.

Admins can manage profile names and bans and inspect group messages. They cannot read private one-to-one chats. Account deletion is not wired into the app yet because it requires a protected Auth Admin operation.

## Hosting

A Cloudflare Pages project named `wasgeht` has been created in Direct Upload mode and reserves:

https://wasgeht.pages.dev

The site is **not live until the first deployment succeeds**. The GitHub-to-Cloudflare Pages connection could not be completed because Cloudflare returned an installation error. Use Cloudflare Pages Direct Upload to deploy the repository root (no build command; output directory `/`), or reconnect the GitHub app and create a Git-integrated Pages project. Cloudflare does not support switching an existing Direct Upload project to Git integration.

## Important limitations

This is an early connected prototype, not a finished WhatsApp replacement. Test with a few trusted people before sharing it publicly.

- Browser notifications currently work only while the site is open. True background push notifications need VAPID credentials and a protected push service.
- Voice/video calls are a basic WebRTC prototype using STUN only. Calls may fail on some networks; reliable calls need TURN infrastructure and a more complete incoming-call flow.
- Status photos/videos, profile photos and group pictures are supported; stickers/GIF search, message forwarding, pinned chats/messages, chat archive/mute, and account deletion are not yet implemented.
- The free hosting/database plans have usage, storage and inactivity limits. This cannot be guaranteed to stay free or run without limits.
