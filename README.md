# WasGeht

**Deine Chats. Deine Welt.** A responsive green-and-white messenger for phones, tablets and computers.

## Live website

https://wasgeht-app.wasgeht.workers.dev

The app is deployed as a Cloudflare Worker. The GitHub repository is the source of truth:

https://github.com/makethegame2goviral/WasGeht

## Features

- Username + password registration and login (internally mapped to a non-deliverable alias; no real email is collected).
- Profiles with username, bio, status text, profile picture and automatic online/offline display.
- Username search, contact requests, accept/decline, block and unblock.
- Private one-to-one chats and public/private groups.
- Public-group join requests; existing group members can accept requests.
- Group creators are owners; members can edit group name, picture and description.
- Existing group history is visible to newly accepted members.
- Text messages, image/video/audio attachments and voice-message recording.
- Message replies, emoji reactions, edit/delete own messages, forwarding and pinned messages.
- Read receipts and delivery state.
- Per-chat mute, archive and pin controls.
- Text, image and video status posts that expire after 24 hours.
- Admin dashboard for accounts and groups. Admins can manage users and inspect group messages. Private one-to-one chats are excluded by database RLS.
- Password change and account deletion.
- Installable PWA shell and responsive layout.
- Incoming and outgoing voice/video call signaling (WebRTC with STUN).

## Backend

WasGeht uses the existing Supabase project **Size**, with isolated `wg_` tables and a private `wg-media` storage bucket. WasGeht migrations do not alter the Size/Zynx tables.

Project URL: https://puddgzxqekteblmlpiqv.supabase.co

The browser uses only the Supabase publishable key. Never put a Supabase service-role/secret key in this repository.

## First-time Supabase setup

1. In Supabase Dashboard, open **Authentication → Providers → Email** and turn **Confirm email** off. The app uses username/password and no real email address, so email-based password recovery is not available.
2. Register with the exact username **WasGehtAdminYusuf** and choose your own strong password.
3. In Supabase Dashboard → SQL Editor, run:

   ```sql
   insert into public.wg_admins(user_id)
   select user_id
   from public.wg_profiles
   where lower(username) = lower('WasGehtAdminYusuf')
   on conflict do nothing;
   ```

4. Sign out and back in. The Admin tab will appear.

## Notifications and calls

- Browser notifications work while the app is open and permission has been granted.
- The service worker can display push events, but true background push delivery is not activated yet. It needs VAPID keys and a protected push sender; no private push key is stored in the public repository.
- Calls use WebRTC with a public STUN server. Some networks require TURN; reliable calls on every network are not guaranteed.

## Important limits

This is an early messenger, not a full WhatsApp replacement. Stickers/GIF search, encrypted end-to-end messaging, chat backup/restore and fully reliable background push are not implemented. Messages are stored by the Supabase service and are not end-to-end encrypted. The free hosting/database plans have usage, storage and inactivity limits, so unlimited free operation cannot be promised.
