# WasGeht

**Deine Chats. Deine Welt.** Ein responsiver Messenger für Handy, iPad und Computer.

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
- Incoming and outgoing voice/video calls for direct chats and groups (WebRTC; the app requests TURN credentials when configured).
- Push notifications for messages and call invitations, including a direct **Beitreten** action for incoming calls.
- Per-user chat clearing and complete removal from the user's chat list, persisted across devices.
- Clear the full message history for everyone in a direct chat; in groups, only the group creator can do this.

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

- Background Web Push uses the `wg-send-push` Edge Function, a VAPID key pair and the private `wg_push_subscriptions` table. The private VAPID key is stored server-side and is never included in this repository.
- Each device must enable notifications from the profile or chat settings. On iPhone/iPad, install WasGeht from Safari's Share menu → Add to Home Screen, then enable notifications from the installed app (iOS/iPadOS 16.4 or newer).
- Message notifications open the relevant chat. Call notifications include a **Beitreten** action and open the invitation in WasGeht.
- Direct and group calls use WebRTC. WasGeht requests TURN credentials from `wg-turn-credentials`; if TURN is not configured, it falls back to public STUN. Some networks may still prevent calls.

## Important limits

This is an early messenger, not a full WhatsApp replacement. Stickers/GIF search, encrypted end-to-end messaging and chat backup/restore are not implemented. Messages are stored by the Supabase service and are not end-to-end encrypted. Push delivery and calls depend on browser permissions, device support and network conditions. The free hosting/database plans have usage, storage and inactivity limits, so unlimited free operation cannot be promised.
