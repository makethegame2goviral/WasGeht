# PINGO — Dein Kreis. Dein Chat.

Dark-first social messenger concept. Tailwind CSS is loaded from the official CDN; the custom stylesheet handles the app layout and call stage.

## Current frontend preview
- Responsive desktop/mobile navigation with fewer visible controls
- Sample private and group conversations
- Local demo message composer
- Moments preview and local demo posting
- Contact list with per-device hide action
- Local display-name setting
- Video-call preview with camera on/off, microphone on/off, front/rear camera switch and hang-up
- Browser media constraints request echo cancellation, noise suppression and automatic gain control
- No demo ring tones or repeated beep sounds

## Important: what is and is not live
This is still a frontend preview. The video screen can access the local camera and microphone after explicit browser permission, but it does **not** connect to another person yet. Real one-to-one and group calls require authenticated signaling, WebRTC peer connections, ICE candidate exchange and a TURN service for restrictive networks. The remote video area remains a waiting placeholder until that backend is implemented.

Messages and contact hiding in this preview are local-only. The local hide action does not delete another user's account or messages from the server. The local display-name setting does not change an authenticated profile yet.

## WasGeht feature migration plan
Bring forward the previous app's feature set in secure stages:
1. Supabase Auth and profiles, username search, contact requests, accept/decline, block/unblock
2. Private and public groups, membership requests, group owners, group picture/name/description
3. Realtime messages, replies, reactions, edit/delete own messages, forwarding, pinning, read receipts, delivery state
4. Per-chat mute/archive/pin and local contact/chat hiding
5. Image/video/audio attachments, voice notes, private storage and validation
6. 24-hour text/image/video Moments, reactions and comments
7. Admin tools with strict server-side authorization and privacy boundaries
8. Reliable Web Push with VAPID sender, tested on installed PWA and real devices
9. WebRTC voice/video calls with STUN and TURN, call notifications, device selection and call quality handling

## Audio and privacy
The browser receives echoCancellation, noiseSuppression and autoGainControl constraints. Actual echo quality depends on the device, browser, headset and acoustic environment; software constraints cannot guarantee that every echo disappears. The app does not play a loud demo beep or ringtone. Camera and microphone are requested only after the user presses the video-call button.

## Free-tier architecture
- Supabase Auth, Postgres + Row Level Security, Realtime and private Storage
- Cloudflare Worker or Supabase Edge Function for protected server-side actions
- Web Push with VAPID keys stored only server-side
- Never expose Supabase service-role keys, VAPID private keys or admin secrets in frontend code
- Enforce membership, ownership and admin permissions in database policies/server-side functions
- Free tiers have quotas, storage limits and possible inactivity restrictions; unlimited free usage cannot be promised

## Run
Open index.html from this folder or serve the folder over HTTPS/localhost. Camera and microphone access generally require a secure context (HTTPS or localhost). Tailwind CDN requires an internet connection.