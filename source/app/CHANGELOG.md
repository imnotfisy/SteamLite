# SteamLite 9.3.2 Changelog

Your play streak is now the same on your PC and your phone.

## Streak
- **Instant sync:** when your streak goes up (a game launch, a restore, or a day counted from a message on your phone), the PC tells SteamLite Online right away instead of minutes later. It also checks for days counted from your phone every 45 seconds.
- **Restores and recovery are shared:** the phone now shows how many streak restores you have and whether a broken streak can still be restored on the PC.

---

# SteamLite 9.3.1 Changelog

Keep your play streak going from your phone.

## Streak
- **Message anyone on SteamLite Mobile to keep your play streak:** away from your PC, sending a message counts as a play day, so your streak no longer breaks when you cannot launch a game. The PC picks the days up within a couple of minutes of starting and your streak goes up as normal.
- Your streak count is shared with SteamLite Mobile 1.2.1, which shows it on the Home page.

---

# SteamLite 9.3.0 Changelog

Your profile look follows you to your phone and to your friends.

## Profiles
- **Your profile look is shared:** your banner, avatar frame, title, accent colour, tagline and 5-game showcase are now published to SteamLite Online (a minute or so after you change them), so friends see them when they open your profile on the PC or in SteamLite Mobile. Your prestige is shared too.
- **Friends' looks show up here:** when you open someone's profile on the PC you now see their banner, title, tagline, accent colour and showcase games.
- Nothing new to switch on: it uses the profile settings you already have. A banner picture is shrunk to fit and uploaded; gradient and solid banners are just colours.

## SteamLite Mobile
- Works with SteamLite Mobile 1.2.0 (Home page, profile pages with all your customisations, Settings page, polls in group chats and more).

---

# SteamLite 9.2.5 Changelog

Start games from your phone.

## Privacy
- **Let my phone launch games** (Settings > More settings > Privacy, off by default): when it is on and SteamLite is open, the **Play on my PC** button in SteamLite Mobile starts that game on this PC. It checks in every 25 seconds, so it can take up to half a minute to start. Only your own signed-in account can send these.

---

# SteamLite 9.2.4 Changelog

Photos, voice messages and more in Messages, matching the new SteamLite Mobile app.

## Messages
- **Photos and GIFs:** the + button now has **Photo or GIF**. You can also paste a picture (Ctrl+V) or drop one into the chat. Pictures are shrunk before they send, GIFs can be up to 1 MB, and your friends see the picture right in the chat.
- **Voice messages:** + > **Voice message** records up to 60 seconds. Press Send or Cancel. Friends get a small player, on the PC and on their phone.
- **Link previews:** a link in a message shows the page's title, picture and site under the message.
- **Quick replies:** + > **Quick replies** sends a saved phrase with one click. Add your own or reset them.
- **What should we play?:** + > **What should we play?** compares your library with everyone in the chat and lists the games you all own, each with a Suggest button that posts it as a game card. Friends with private game details are skipped.
- **Pinned chats:** pin up to 5 chats to the top of your list (hover a chat and press the pin).
- Messages from SteamLite Mobile (photos, voice messages) now show up here.
- **SteamLite Mobile:** a card above your chats (and a tile in More) links to the new Android app. Hide the card with the cross.

## Behind the scenes
- Problems inside the app are sent, a few per session, to the SteamLite admin Activity log so they can be fixed quickly. No messages or personal files are sent.

---

# SteamLite 9.2.3 Changelog

A one-time library connection, a rebuilt Account page, verified players and a far richer Messages.

## Connect your Steam library once
- **No more Steam ID.** Your Steam ID is the account you signed in with, so you never type it and there are no profiles to manage.
- **One popup for the Steam Web API key.** After your first sign-in SteamLite asks for your key once, checks it with Steam and saves it, encrypted, to your SteamLite account. On any other PC you sign in on, it connects by itself, with no popup.
- If you already had a key set up, it is saved to your account quietly the first time you open this version.

## Account page (rebuilt)
- **Settings > Account** is a new profile card: your Steam picture and name, the verified tick if you have one, member since, your friend code with a Copy button, and a Sign out button.
- Cards for your Steam library connection, cloud backup (back up, restore, restore the one before) and your data (delete your account). The old Change Profile and Logout buttons are gone, and More settings now points here.

## Look
- The sidebar logo (and the welcome window) now use the same Steam icon as the sign-in screen, instead of the old layers symbol.

## Messages (much better)
- **Emoji:** an emoji picker with categories and your recent ones, :shortcodes: like :fire: and faces like :) turn into emoji as you type, and a message of just 1 to 3 emoji is shown big.
- **Reactions:** hover a message and pick a reaction (16 quick ones and a full set of 32). Click a reaction chip to add or remove yours.
- **Replies and edits:** reply to a message with a quote that jumps to the original, press the up arrow to edit your last message (for 15 minutes), and see "edited" on changed messages.
- **Share games:** the + button shares a game as a card with its picture and your hours. The people you send it to see a green **Buy on Steam** button, or "In your library" if they already own it.
- **Share game lists:** make a list (pick games, or add your favourites, a collection or your wishlist) and share it. Anyone can open it, see which games they own and buy the rest.
- **Pin, search, mute:** pin up to 5 messages, search a chat, mute a chat's pop-ups, load earlier messages, copy text and keep unfinished messages as drafts. Links in messages open in your browser.
- **Presence:** friends show as online with a green dot and what they are playing. In a group chat a strip shows who is playing what right now. You can turn this off in More settings > Privacy.

## Profiles and challenges
- **Profiles:** click anyone's picture (in chat, the friends list, theme authors or the leaderboard) to see their level, hours, streak, achievements, bio, game lists and published themes, with a Get theme button. Stats are shown to friends. Write your own bio from Settings > Account > View my profile.
- **Friend challenges:** start a challenge with friends (most hours, achievements, streak or level over 3 to 30 days). Everyone gets a live scoreboard and a group chat, and the winner is announced when it ends.
- **Themes:** a Featured row in the Community tab, a Top creator badge for popular theme makers, and theme authors link to their profile.

## Safety
- Flooding messages now mutes the sender for 15 minutes automatically. The admin page can search all messages, shows an activity log of admin actions, and flags players whose stats jump in a way that is not possible.

## Fixes and clean-up
- **Dashboard widgets are removed.** The row of cards above the dashboard (continue playing, this week, daily goal, clock, theme of the week) and its switch in Tools are gone.
- **Your SteamLite account now uses your Steam profile picture** (Settings > Account, chat, friends and profiles), kept up to date automatically.
- **Chat no longer blinks:** the Seen label and reaction chips only animate when they first appear, not every few seconds.
- **Settings page:** the cards' shadows are no longer cut off into squares, and the page fades softly at the top and bottom instead of a hard line.
- Saving settings now says "Settings saved." instead of "Advanced settings saved.".

## Verified players
- Trusted players can be given a blue verified tick by an admin. It shows next to their name in chat, the friends list, group members, theme authors, the leaderboard and their own Account page.
- **Owner tier:** the admin page now offers **Verify** (blue tick), **Make owner** (a gold crown badge) and **Remove tick**. An owner has everything in SteamLite unlocked: every theme (event ones too), avatar frame, title, shop and trophy-room item and level reward, with nothing to buy. It is tied to the SteamLite account, so it follows the owner to any PC, and new things added in later updates are unlocked automatically.
- The server admin page has a new **Players** section: search by name, Steam ID or friend code, then Verify, remove the tick, or mute someone.

---

# SteamLite 9.2.2 Changelog

Themes rebuilt, theme publishing, and a much nicer chat.

## Themes (rebuilt)
- **One new Themes window** (Official, Community and My library) with a live mini preview of every theme, so you see the colours before you apply them. It replaces the old Theme Shop.
- **Community tab:** themes made by SteamLite players. Search, sort by most liked, newest or most downloaded, like a theme, preview it on the whole app, then apply it. Applying downloads it and saves it in My library so it works offline.
- **My library:** everything you made or downloaded, with Apply, Preview, Edit, Export and Delete, and Publish or Unpublish for your own.
- Themes you download are kept separately, so they no longer count towards the Theme Author achievements.
- Fixed: themes you created could disappear from the list after a restart.

## Theme Maker (new)
- Pick a starting palette (Midnight, Ocean, Sunset, Forest, Mono, Candy, Paper), your current look, or press Surprise me.
- A big live preview updates as you change colours, with a readability check on the text. You can also try it on the whole app while you edit.
- **Publish to SteamLite:** one button shares your theme with everyone. It goes live straight away (colours are always fine; the extra CSS can not use images, imports, scripts or url(...)). You can unpublish it any time, and anyone can report a theme. Moderators can remove themes from the server admin page.

## Chat
- **Typing indicators:** a friend typing shows the animated three-dot bubble in the chat and "typing" under their name. In groups it says who is typing.
- **Animated messages:** new messages slide and pop in, your own messages appear at once as sending and settle when delivered, and a failed message can be retried.
- Messages are grouped in neat stacks, there is a New messages marker, a new-messages pill when you have scrolled up, and a character counter near the limit.
- Emoji you type in a message stay emoji.

---

# SteamLite 9.2.1 Changelog

Messages: chat with friends, group chats and friend streaks, all through your SteamLite account.

## Messages (new)
- **Open Messages from the folder button in the header** (a red number shows unread messages). Messages are plain text, up to 1,000 characters, and are kept for 30 days.
- **Friends:** add a friend with their friend code (shown in the Friends tab), or press Find my Steam friends on SteamLite to see which of your Steam friends already use it. Both of you have to agree before you can chat.
- **Private chats and group chats:** groups hold up to 20 friends. The owner can add and remove people and rename the group, and anyone can leave.
- **Friend streaks:** every day that you both send each other a message adds one to your streak. Miss a day and it starts over (your best streak is kept). A flame shows the streak in the chat and the friends list, and you get a reminder in the evening when one is about to end.
- **Seen markers, unread badges and pop-ups** for new messages and friend requests. Switch them off in More settings > Notifications (Messages and friend requests) or snooze all pop-ups.
- **Safety:** block anyone, report a message, and delete your own messages. Reports go to a moderator view on the server admin page, where a player can be muted for a while. Deleting your account removes your messages, friends and streaks.
- Messages are private between the people in the chat, but they are not end-to-end encrypted: they are stored on SteamLite Online so they can reach your friends.

---

# SteamLite 9.2.0 Changelog

Accounts: sign in with Steam, keep your progress in the cloud, and a SteamLite Online that is always on.

## Signing in is now required
- **A sign-in screen on every launch until you are signed in.** It asks you to sign in with Steam; when it works it says who you are and offers a Restart SteamLite button, and SteamLite then opens with your account's Steam profile. After that it opens straight away.
- **Offline is fine:** once you have signed in, SteamLite keeps working with no internet or when the server is down. Only the very first sign-in needs a connection.
- **Both editions** (Full and Lite) use the same sign-in. Signing out in More settings brings the sign-in screen back.

## Sign in with Steam (new)
- **More settings > SteamLite account > Sign in with Steam.** Steam's own page confirms who you are; SteamLite never sees your password. It is optional, and everything works without it.
- **Cloud backup:** settings, XP, achievements, drops, coins and events are saved to your account about once a day (or press Back up now). Restore on any PC, or go back to the backup before the latest.
- **Your leaderboard name is yours:** signed-in players get a tick, and nobody else can take your name. Votes, shared themes and likes follow you between PCs.
- **Delete my account** removes your backup, leaderboard entry, votes and shared themes from the server.

## SteamLite Online
- The server now runs on Cloudflare, so the leaderboard, community themes, votes and announcements are available around the clock, with no PC needed.

---

# SteamLite 9.1.0 Changelog

The biggest feature update since 9.0: Drops, a Shop, a Trophy room, dashboard widgets, smart collections, tags, more languages, accessibility options and a lot more.

## Drops (new)
- **Free XP three ways:** an hourly drop, a 5-hour drop and a daily drop, 5,000 - 10,000 XP each. Open the gift icon in the header folder. A red badge shows when something is ready.
- **Daily streak:** claim the daily drop on consecutive days for +10% XP on every drop per day, up to +70%.
- **Rarity:** every drop is Common, Rare or Epic, with its own colour, and Epic drops play an extra chime. Each drop type has its own sound.
- **Coins:** every drop also pays coins (1 per 100 XP) to spend in the Shop.
- **Lucky wheel:** one free spin a day for XP, coins or even a streak restore.

## Shop, Trophy room and Events
- **Shop:** buy avatar frames and profile titles with coins. Four daily picks change every day at midnight, and limited-time items appear only while an event is on (Halloween, Winter Holidays, Spring Bloom, Summer Splash, SteamLite Day). 11 new avatar frames.
- **Trophy room:** every frame, title and reward theme in one gallery, what you own and how to get the rest.
- **Events calendar:** all events with their dates every year, rewards and your progress.
- **Seasonal effects on your profile** (snow, embers, petals, sparkles) while an event is on. Switch them off in More settings.

## Dashboard
- **Widgets** above your dashboard: Continue playing, This week (hours per day), Daily goal (a ring you can set), Clock and Theme of the week. Switch each on or off in Tools & extras > Dashboard widgets.
- **Weekly recap** (every Monday it offers itself) and a **Stats card**, both savable as pictures.

## Profile
- **Pinned achievements:** pin up to 3 achievements under your name (Edit Profile).
- **Banner from a game screenshot:** pick one of your Steam screenshots in the banner editor.

## Library
- **Smart collections:** make collections from rules (installed, hours played, played recently, not played for a while, favorites, status, tag, name). They fill themselves and appear in the sidebar.
- **Tags:** right-click a game > Tags. Filter the library by tag in the Filters menu.
- **Links & folders** on every game page: guides, mod pages or your save folder.
- **Wishlist price chart:** click a price graph for a bigger chart with the lowest and highest price seen.
- **Pre-launch check:** a heads-up if Steam has an update waiting for a game or the drive is almost full.
- **Hour milestones:** a toast at 10, 50, 100, 250, 500 and 1000 hours in a game.
- **Notes after long sessions:** offers to write a journal note after 20+ minutes of play.
- **Ignore time away (optional):** idle time is not counted as playing.

## Social
- **Friend challenge:** who played the most in the last 2 weeks (public profiles only).
- **Post achievements to Discord:** paste a webhook and your unlocks (or only the big ones) appear in a server.
- **Event on your Discord card:** for example "SteamLite Day: 3/5 quests" while you are browsing.
- **What should we add next?** A list of ideas you can vote on (votes are counted on GitHub).

## SteamLite Online (new)
- **Live poll votes:** the "What should we add next?" list shows real vote counts and lets you change your vote.
- **Global leaderboard:** the top players by level, hours, streak or achievements. You only appear if you switch it on and pick a name; only your name, level, hours, streak and counts are shared.
- **Community themes:** browse, like and apply themes other players made, or share your own. Every shared theme is checked and reviewed before it appears.
- **Live announcements and special gifts:** news from the SteamLite team shows up in your dashboard news, and a special gift can wait in Drops for a short time.
- All of it needs the SteamLite server to be reachable. When it is not, nothing breaks: those windows just say so.

## Everything else
- **Search everywhere:** the command palette (Ctrl+K) also finds achievements, settings sections, themes, tags and smart collections.
- **More languages:** Spanish, French, German, Portuguese and Italian join Bulgarian (main screens and menus).
- **Accessibility:** high contrast, strong keyboard focus, larger click targets, spoken names for icon buttons, game cards usable with the keyboard.
- **Notification rules:** mute kinds of pop-ups (sales, friends, rewards, updates) or snooze them all for 1, 8 or 24 hours.
- **Theme by season:** pick a theme for winter, spring, summer and autumn.
- **Restore points:** SteamLite saves your settings and progress once a day and right before the Updater opens, and you can restore one in More settings.
- **Works offline:** the library, friends and news you saw last are kept and shown when the network is down.
- **Couch mode:** a Drops panel (claim with a button, see event quests) and remappable controller buttons in Settings > Behaviour.

---

# SteamLite 9.0.4 Changelog

## New: Drops
- **Free XP, three times over.** There is a new gift icon in the header folder (it shows a red badge when something is ready). Open it to claim:
  - an **hourly drop**, ready again 1 hour after you claim it,
  - a **5-hour drop**, ready again 5 hours after you claim it,
  - a **daily drop**, ready again every new day.
- Every drop gives a random **5,000 - 10,000 XP**. The XP counts towards your level (and can level you up), is kept in your backups, and is not changed by the weekend or event boosts.
- The drops window counts down to the next one, and the badge appears by itself the moment a drop is ready.

---

# SteamLite 9.0.3 Changelog

**SteamLite Day** is here: a new limited-time event with quests, from October 7 to October 14.

## SteamLite Day (October 7 - 14)
- **Complete 5 quests (not achievements) to earn limited-time rewards:** the exclusive **SteamLite** profile title, the exclusive **SteamLite** avatar frame and the exclusive **Remembering the Roots** theme (deep purple all across the board). Rewards are yours for good, but they can only be earned while the event is on.
- 7 quests to choose from, and any 5 count: play a game through SteamLite, play 3 different games, play for 2 hours in total, play on 3 different days, play one session of 45 minutes or more, start a session after 6 PM and apply a theme from the Theme Shop. Progress is counted from the play sessions SteamLite tracks during the event.
- The quests and your progress are in the achievements window, under the event's name.

## Events on the dashboard and in the achievements window
- **When two or more events are on at the same time, every one of them is shown on the dashboard.** The event that ends first is on top (SteamLite Day sits above Halloween this week).
- **While an event is on, the achievements window only lists the events that are on;** the ended ones are hidden until nothing is running.
- SteamLite Day does not change the XP boost.

## Compact library, reworked
- The Compact List option has a new look: every game is one glass row with a bigger rounded cover, the name and install status, hours played, when you last played it, an achievements chip and the favourite star. Rows slide and glow with an accent bar on hover, and the columns drop away gracefully in narrow windows.

## Also
- The avatar frame picker now lists the season frames (Frost, Bloom, Blaze, Harvest) once you have earned them; they could not be picked before.

---

# SteamLite 9.0.2 Changelog

An emergency fix for 9.0.1.

## Fixes
- **Clicking a tab in Settings pushed the top bar half off the screen.** Settings now only scrolls its own list, and the header stays put.
- The header's shadow still follows its rounded shape.

---

# SteamLite 9.0.1 Changelog

A tidier header, a floating player you can move, 15 new achievements, 3 new themes, icons instead of emojis, a bigger XP scale and a more modern news widget.

## A tidier header
- **The header now starts at the very top** of the window, so there is no empty strip above it any more, and the version number is gone from the top.
- **Minimise and close are part of the header.** The buttons keep their size; the other header buttons moved over to make room.
- **One folder for the extras.** Inventory, Achievements, Wishlist & sales, Notifications and Tools & extras are inside a single folder button, like on a phone. Click it and a box opens with big icons; the red badge on it shows unread notifications.
- **Now playing is a floating pill.** Drag it anywhere on the window and it remembers the spot (double-click it to send it back). Click it for the full player, which now opens next to it and always stays on screen.

## News & Announcements
- The dashboard widget was rebuilt: the newest item is a large highlighted card, the rest are compact cards with a type icon (release, coming soon, fixes, themes), a label and the date. Click a card to read all of it.

## New
- **15 new achievements:** Hundred Days (100-day streak), Century of Days (play on 100 different days), Launch Master (1000 launches), Lifer (5000 hours), Obsessed (250 hours in one game), Ultra Marathon (an 8-hour session), Session Legend (1000 sessions), Archivist (own 1000 games), Jack of All Trades (play 150 different games), Display Cabinet (50 SteamLite achievements), Halfway There (level 50), Maxed Out (level 100), Triple Crown (100% in 3 games), Nocturnal (25 sessions between 2AM and 5AM) and Theme Smith (create 3 themes). Hundred Days, Halfway There and Triple Crown also give a streak restore.
- **3 new themes:** Royal Gold, Mocha Cream and Sakura Night (Theme Shop, free).
- **Icons instead of emojis.** Every emoji in the app is now a clean icon that follows your theme colours: Settings, the tools hub, notifications, achievements, the tour, menus and pop-ups.

## XP and levels
- **A level now takes 80,000 XP** (it used to be 50). To match, everything that gives XP is 1000x bigger: achievements give 60,000-140,000 XP, daily and weekly challenges, bingo, the season track and the challenge bonuses too.
- **Nobody loses a level.** The XP you had already earned was converted once, so your level, titles, frames and rewards stay exactly where they were. Old backups are converted when you import them.

## Fixes
- A sideways scroll bar appeared along the bottom of the sidebar while hovering it in Settings.
- The Developer section was removed from Settings.
- The first window opened after launching the app flashed white in the blur; the blur is now prepared while the app loads.
- The Spotify pop-up could be cut off at the bottom of the window.

---

# SteamLite 9.0.0 Changelog

The biggest update yet: a new look and a new layout, a Settings page, couch mode, Spotify, a much better Discord card, and a long list of performance and polish fixes. Everything from the 9.0 betas is in here, and XP, levels, seasons and SteamLite achievements are back to normal.

## A new look and layout
- **Glass interface.** The wide sidebar is now a slim floating glass rail that opens when you point at it. The title strip and header are one floating bar, the dashboard uses the extra width and starts with a greeting (with your streak, games and hours played), and windows, menus and the friends list are frosted glass that takes its colours from your theme. **Classic** is still there: Settings > Advanced > Interface switches instantly.
- **Settings is a full page** with a section list, a search box and a save bar for unsaved changes. Everything from Settings and Advanced Settings is on it.
- **Tools & extras was redesigned** with search, category chips and a tile grid.
- **Modern notifications** (a status badge, a countdown line, a real fade-out), scrollbars that stay clear of rounded corners and fade after 5 seconds, round buttons and sliders that show how far they are filled.
- **More motion.** Library sections collapse and open smoothly, refresh buttons spin, menus pop in, and the Favorites button in the sidebar only shows when you have favourites and pops in and out.
- The profile title tag sits next to your username (after the developer badge).

## Couch mode
- A **fullscreen, controller-first launcher** (controller button in the top bar, Ctrl+Shift+G, the command palette or Settings > Behaviour > Couch mode). Big covers in rows (Continue playing, Favorites, Most played, All installed, Not installed) and a hero panel for the game you are on.
- **A game page for every game,** sized for the TV: Play / Stop / Install, Favorite, Status and Rating, and Overview, Achievements, Screenshots and News tabs.
- **D-pad or stick** to move, **A** open or select, **B** back, **X** favourite, **Y** play / pause music, **LB / RB** change track or tab, **Start** exit. The Play button uses the same launch tracking as the normal one (Loading..., Stopping..., Stop).
- Smooth transitions in and out, goes fullscreen and back, can start with SteamLite or open when a controller connects.

## Music and Discord
- **Spotify now playing:** a small player in the top bar with the album art and play / pause / next / previous, and a full player with a progress bar you can click. No login: it reads the Windows media information. Off by default (Settings > Behaviour > Now playing); Spotify only or any media player.
- **Discord Rich Presence:** the game's art, a correct timer, achievement progress, your streak and "View on Steam" / "Get SteamLite" buttons; a browsing card showing the page you are on; privacy options (hide the game, browsing, streak, buttons or game names); it reconnects by itself and connects when you open Discord later.

## Editions, updates and performance
- **Full or Lite edition** chosen at install and switchable in Settings > Advanced > Edition, plus an optional **Memory saver**.
- **Idle CPU:** SteamLite no longer uses a CPU core while sitting open (the endless card shimmer and the background glow were the cause).
- **Betas and the Updater.** Betas are pre-releases in this repository (`version-beta.json`, `news-beta.json`). The SteamLite Updater can switch between Stable and Beta from a link at the top of its window, can go from a beta back to the latest stable, and is now always replaced by the installer, with no more "restart your computer" page at the end of setup.
- At most 4 news entries are shown on the dashboard.

## Fixes
- White browser-default buttons in dialogs, the Theme Shop title wrapping, the friends list sitting at the wrong height and sliders drawn as a thick white bar were fixed.
- Opening the first Tools & extras window after launch now animates like the rest.
- Setup no longer asks you to restart Windows.

---

# SteamLite 8.7.4 Changelog

## Fixes
- **No more "restart your computer" prompt after installing.** 8.7.3 asked Windows to delete the old SteamLite Updater at the next restart, which showed a reboot page at the end of setup. It no longer does that; the Updater removes the leftover file itself the next time it opens.

## New
- **Switch between Stable and Beta in the SteamLite Updater.** Click the "Channel" link at the top of the Updater window to flip between Stable and Beta; it checks that channel straight away and remembers your choice. From a beta, switching to Stable offers the latest stable version.

---

# SteamLite 8.7.3 Changelog

The SteamLite Updater now really gets updated.

## Fixes
- **The Updater was never replaced when it ran the update itself.** The installer skipped copying a new "SteamLite Updater.exe" if the old one was running (which it is when it started the install), so the Updater stayed on its old version for good, including the old beta location. The installer now moves the running copy aside and installs the new one, so the Updater always matches your SteamLite version.
- With the new Updater, the Beta channel finds betas in the main SteamLite repository (the old separate beta repository is no longer used).

---

# SteamLite 8.7.2 Changelog

Betas now live in the main SteamLite repository.

## Changes
- **Beta channel moved.** When you choose the Beta update channel (Settings > Advanced), SteamLite and the SteamLite Updater now look for betas in the main repository as pre-releases (a `version-beta.json` file) instead of the separate beta repository. Stable users never see a beta, and the Updater's "Other versions" list only shows pre-releases on the Beta channel.
- Nothing else changes: this is 8.7.1 with the new update logic.

---

# SteamLite 8.7.1 Changelog

Smooth animations again.

## Fixes
- **Animations are smooth again.** Memory saver is now **off by default**, because drawing with the CPU made animations and transitions choppy. Turn it on in Settings > Advanced only if you prefer lower memory over smoothness. If you had it on, it is reset to off.
- The drifting background glow moves smoothly again (it still pauses when the window is not in front, and the card shimmer still stops once a cover has loaded, so idle CPU stays low).

---

# SteamLite 8.7.0 Changelog

The Performance Update: SteamLite now uses roughly 30% less memory and almost no CPU while idle, and there are two editions to choose from.

## New
- **Two editions, one installer.** Choose **Full** (everything) or **Lite** (just the basics to browse and launch games) when you install, and switch any time in Settings > Advanced > Edition. SteamLite restarts and keeps your games, settings and progress. The updater is included with both.
- **Memory saver** (Settings > Advanced, on by default). Draws with the CPU instead of the GPU and runs without separate graphics and audio processes. Memory use drops from about 225 MB to about 160 MB in our tests (the game list size changes this), and it also removes the GPU process from Task Manager. Turn it off if animations or video backgrounds feel slow. Needs a restart.

## Fixes (performance)
- **Idle CPU.** SteamLite was using about one full CPU core while sitting open. The loading shimmer on every game card kept repainting forever, and the drifting background glow made the GPU re-blur every panel on every frame. The shimmer now stops once a cover has loaded and the glow moves in a few small steps per second, so idle CPU is close to zero. The glow and a looping background video also pause while the window is not in front.
- Game cards that are scrolled out of view are no longer laid out or painted.
- Background network features that SteamLite does not use are switched off.

---

# SteamLite 8.6.5 Changelog

A huge update: about 40 new features. Almost all of them live in the new **Tools & extras** hub (the grid button at the top, or "Tools & extras" in the command palette), and every tool also has a command palette entry.

## New

### Play smarter
- **What should I play?** Pick how long you have (30 min, 1 hour, 2+ hours) and your mood (surprise me, keep going, something new, quick win, backlog) and it suggests three games from your library, with the reason for each.
- **Up Next queue.** A list of games you plan to play, in order. Drag to reorder, add from the right-click menu or any game window, and "What should I play?" favours it.
- **Closest to 100%.** Games where only a few Steam achievements are left, closest first, with a one-click scan of your whole library.
- **Estimated play time.** Every game window shows how long players typically spend in it (from SteamSpy) next to your own time.
- **Game status in the palette.** With a game open, the command palette can set its status or add it to Up Next.

### Stats and your history
- **Play calendar.** A heatmap of every day you played in the last year, with your longest run, longest break, best week and busiest weekday.
- **Library stats.** Library value at full price, cost per hour (best and worst value), unplayed value, genres by playtime (after a SteamSpy scan) and a duplicates finder that can hide the extra copy.
- **Export.** Save your library with playtime, status, rating, achievements, genres and price as CSV or JSON.
- **Game journal.** Write notes inside any game, and see your notes and sessions together on one timeline.

### Money
- **Wishlist price alerts.** Set a target price on any wishlist game and get a notification when it drops that low. The wishlist also shows each game's lowest price seen and a small price history line.
- **Free games and sales.** Free-to-keep Steam promotions, discounts of 75% or more, and a calendar of the big sales with a countdown (the dates are the usual ones - Steam announces the exact days).

### While you play
- **Game mode.** Mutes pop-ups and notification sounds while a game is running.
- **Session widget.** A small always-on-top timer and clock (plus a break nudge) for windowed and borderless games, in the corner you choose.
- **Shutdown timer.** Turn the PC off when your game closes, or after a set time, with a 60-second warning and a cancel button.
- **Launch profiles.** Per game: run on above-normal or high priority, a high-performance power plan while playing (restored afterwards), and programs to close before launch.
- **Game save backups.** Choose a game's save folder and back it up by hand or automatically when the game closes, then restore any of the last 8 (a safety copy is made first).
- **Co-op finder and friend game alerts.** See which games you and a friend both own, most played first, and get told when a friend starts a game you own.

### Library
- **Import Epic and GOG games.** Finds games installed through the Epic Games Launcher and GOG Galaxy and adds them like non-Steam games.
- **Library health check.** Finds games Steam thinks are installed but are missing, half-installed or empty, and cleans up leftover shader cache from games you no longer have installed.
- **Big libraries are smoother.** Game cards are added in batches as you scroll instead of all at once.

### Progress
- **Seasons.** A reward track for every three months (Frost, Bloom, Blaze, Harvest) with 20 tiers fed by the XP you already earn: titles, a streak restore, an avatar frame, a tray icon and a theme.
- **Weekly bingo.** A 3x3 card of small play goals every week. Each line gives bonus XP, and the whole card gives more.
- **Challenge bonuses.** Clear all three daily challenges for +20 XP, all three weekly ones for +60 XP, and every daily for 7 days in a row for +100 XP.
- **Prestige.** At level 100 you can prestige: your level starts again with a star (★), a gold icon and a title, and you keep everything you unlocked.
- **Cosmetics.** Four new season avatar frames, season and prestige tray / window icons, and two new sound packs (Crystal at level 30, Deep at level 60).
- **Spring Bloom event (March 20 - April 5).** Six achievements and the Spring Bloom theme, yours forever once earned.
- **Five new themes:** Spring Bloom and one theme for each season.

### Social and sharing
- **Profile card.** A picture of your profile - level, title, frame, streak and most played games - to save and share.
- **Theme share codes.** Copy your current look as a short code, or paste a code to try someone else's theme. Codes can only carry colours and styling, and anything that could load web content is refused.

### Settings, safety and support
- **Notification history.** A bell at the top keeps the last 50 pop-ups, including ones you missed.
- **Automatic backups.** Pick a folder and SteamLite saves a backup of your progress and settings on a schedule (never your login). Backups now include your streak restores, prestige and seasons.
- **Diagnostics.** A page with your version, system, settings summary and recent errors to copy when you need help. It never includes your API key or SteamID.
- **Day / night themes.** Switch theme automatically by time or with Windows (only themes you own).
- **Per-game accent.** The app takes its colour from the cover of the game you open (optional).
- **Controller navigation.** Move around with a gamepad: D-pad or stick, A to open, B to go back, LB / RB to switch page, Y for the hub.
- **Command palette 2.0.** Your most-used commands come first, search finds things even when you type only some of the letters, and Enter and the arrow keys work.
- **Quick account switch.** If you have more than one saved account, the tray menu can switch between them.
- **Bulgarian.** The main screens can be shown in Bulgarian (Extras settings > Language). The rest stays in English for now.
- **Update tour.** After an update, a short tour shows what is new and lets you try each feature.
- **Beta channel warning.** Switching to the beta channel now asks you to confirm.

## Fixes
- The link-opening call now only accepts web and Steam links.
- The SteamLite level and season rewards now follow your prestige.

---

# SteamLite 8.6.1 Changelog

A balance update: levels now come slower, streak restores are rare, and events only show up while they are on.

## Changes

### Streak restores are rare now
- **Smaller rewards.** The five achievements that gave 5 streak restores (the three event finales and the two community picks) now give 1. Level rewards are 1 restore at level 25, 1 at level 50, 2 at level 75 and 3 at level 100 (they used to start at level 10).
- **You can hold at most 5.** A reward that would go over the limit is capped, and a level reward waits until you have room.
- **What you have is kept.** Nobody loses restores they already own, and levels you have already reached do not pay out the new level rewards.

### XP boosts, with diminishing returns
- **Events double all XP.** While an event is on (Halloween, Winter Holidays, Summer Splash), every achievement and challenge gives double XP.
- **Weekends still give 1.2x**, and the two add together (event + weekend = 2.2x), they do not multiply.
- **The bonus fades during the day.** The more boosted XP you earn in a day, the weaker the bonus gets: about 75% strength after one achievement, 50% after three and 25% after nine. It resets every day, so a boosted day helps without making levels fly by. The Inventory shows what is active and how strong the bonus still is.

### Events only show while they are on
- **Events that are not running are hidden.** The Achievements window and the Theme Shop no longer list the Halloween, Winter Holidays or Summer Splash achievements and themes outside their dates. Achievements you already earned stay visible, and so do themes you own.

---

# SteamLite 8.6.0 Changelog

## New

### Levels, rewards and challenges
- **Spendable streak restores.** When a streak of 3 or more breaks, the Inventory shows a "Use a streak restore" button. Spend one and the streak comes straight back (earning any achievement still brings it back for free within 5 days).
- **Level rewards.** Levelling up now gives you things: 13 profile titles (Newcomer at level 1 up to Ascended at 100), 5 new animated avatar frames (Flame at 12, Aurora at 22, Gold at 35, Galaxy at 55, Legendary at 75) and bonus streak restores at levels 10, 20, 30, 40, 50, 75 and 100. The Inventory lists what you have and what comes next.
- **Profile titles.** Pick a title from your levels or from any achievement you have unlocked in Edit Profile. It shows under your name on your profile.
- **Daily and weekly challenges.** Three of each, picked fresh every day (and every Monday), such as "Play 2 different games" or "Play for 8 hours". Each one pays bonus XP (1.2x on weekends), and you get a pop-up when you finish one. They are in the Inventory.

### New features
- **Wishlist and sales.** A new button at the top (and "Wishlist and Sales" in the command palette) lists your Steam wishlist with prices and discounts, on-sale games first. SteamLite also checks every few hours and tells you when something on your wishlist goes on sale (switch this off in Advanced Settings). Your Steam profile and game details need to be public.
- **Game status and rating.** In every game you can set Playing, Backlog, Completed or Dropped and give it 1 to 5 stars. The status shows on the game card, and the library filter can show just one status, or just the games you rated.
- **Year in Review.** A shareable picture of your year: total hours, your top 5 games, sessions, days played, best streak, achievements and level. Save it as a PNG, and look back at last year too. Open it from the command palette.
- **Play-time reminders.** In Advanced Settings: a break reminder after a number of minutes of playing one game, and a reminder when you pass a daily play limit. Both are off until you set them.
- **Run as administrator.** A new option in each game's properties for games that need it (it needs a custom .exe, and Windows asks for permission).
- **Friend activity.** A new "Activity" link in the friends list shows who started or stopped playing what and who came online. It is recorded while SteamLite is open.

### More events
- **Winter Holidays (December 1 - 31)**: 6 achievements (Merry Christmas, Advent Calendar, Gift Wrapped, By the Fireside, Auld Lang Syne and the Christmas Spirit finale) and the **Winter Wonderland** theme, yours forever once you earn it.
- **Summer Splash (June 21 - July 5)**: 6 achievements (Solstice, Sunny Days, Beach Bum, Sale Hunter, Midnight Swim and the Summer Survivor finale) and the **Summer Splash** theme.
- Like Halloween, each event has a dashboard banner with a theme preview and can only be earned while it is on. There are now 67 achievements in total.

### SteamLite Updater
- **Other versions.** A new "Other versions..." link lists every release, so you can also go back to an older version if a new one gives you trouble. Your games, settings and achievements are kept.
- **Install when I close SteamLite.** The update window has a new option that installs the update as soon as you quit SteamLite, without more clicking.

## Notes
- The new achievements, challenges and level rewards all count towards your level. Level 100 stays a long-term goal.
- The new themes are included in SteamLite itself, so they appear in the Theme Shop as soon as you update.

---

# SteamLite 8.5.2 Changelog

A bug-fix release - nothing new, just things that were wrong.

## Bug fixes

### SteamLite Updater
- **Wrong install picked.** If you had an old "just me" copy of SteamLite listed next to a newer "all users" one, the Updater could read the old one's version and update the wrong folder. SteamLite now tells the Updater which folder it is running from, and without that the Updater only trusts installs whose SteamLite.exe is really there and takes the newest.
- **"Try again" after a failed re-check** could start downloading the previous result instead of checking again.
- **Smoother window.** The Updater now repaints without flickering.

### Flicker and display
- **Friends list and your profile in the sidebar** refreshed every 30 seconds by rebuilding everything, which made avatars, the name and the online dot flash. They now only change when something actually changed, and the avatar is kept when a refresh fails.
- **Game ambient glow** (the soft colour behind a game's window) did not work because the cover could not be read for colour. It does now, and a stale glow from the previous game is cleared when a cover can't be read.
- **Missing background files.** If your custom background image or video was moved or deleted, the window was left empty. It now falls back to the normal background.
- **Background video speed** was ignored when the video loaded. The speed setting works again.
- **Theme Maker colour pickers** for Glass, Glass Light and the borders showed black. They now show their real colours.

---

# SteamLite 8.5.1 Changelog

## New

### 15 new achievements, each with its own theme
Every new achievement gives a random 60-140 XP like the others, and unlocks a new theme in the Theme Shop that is yours to keep.

| Achievement | How to get it | Theme |
|---|---|---|
| 🎉 Weekend Warrior | Play on 8 different weekend days | Weekend Warrior |
| 📅 Regular | Play on 14 different days | Regular Teal |
| 🗓️ Calendar Keeper | Play on 60 different days | Calendar Sapphire |
| 🚀 Long Haul | Play 10 sessions of 2 hours or more | Long Haul Copper |
| 🎯 Launch Legend | Launch games 500 times | Launch Legend Onyx |
| ⌛ Quarter K | Play for 250 hours in total | Quarter K Jade |
| ⏳ Time Lord | Play for 2500 hours in total | Time Lord Amethyst |
| 💖 Devoted | Play 100 hours of a single game | Devoted Rose |
| ⭐ Favourite Things | Add 10 games to your favorites | Favourite Coral |
| 🗂️ Organiser | Create 3 collections | Organiser Slate |
| 🔎 Achievement Hunter | Unlock 10 SteamLite achievements | Hunter Moss |
| 🏅 Trophy Case | Unlock 25 SteamLite achievements | Trophy Bronze |
| ⚡ Rising Star | Reach SteamLite level 25 | Level-Up Electric |
| 🧊 Restore Hoarder | Hold 5 streak restores at the same time | Hoarder Ice |
| 🔥 Fortnight Strong | Reach a 14-day play streak | Fortnight Ember |

### Bug fixes
- **"Update now" now opens the SteamLite Updater for "all users" installs too.** The installer puts the Updater under ProgramData for those installs, which SteamLite did not look in, so it quietly used the old in-app update instead.

### Notes
- There are now 55 achievements, so level 100 (4,950 XP) is reachable: they average about 5,500 XP in total, or about 4,700 without the October-only Halloween ones, and weekend boosts help.
- Achievements that you already qualify for unlock the next time SteamLite checks (when it starts, or when you open Achievements), and their themes are granted at once.
- The new themes are included in SteamLite itself, so they appear in the Theme Shop as soon as you update.

---

# SteamLite 8.5.0 Changelog

## New

### SteamLite levels
- **Levels and XP.** Every SteamLite achievement, the Halloween event ones included, gives a random 60-140 XP (100 on average) when you unlock it. Each level takes 50 XP and the highest level is 100. Achievements you already had count as 100 XP each.
- **Weekend XP boost.** Every Saturday and Sunday all XP is boosted by 1.2×. The Inventory shows whether the boost is active, when it ends, or when the next one starts, and the achievement pop-up marks boosted XP.
- **Shown beside your Steam level.** Your profile now shows "SteamLite Lv" next to your Steam level, with a small bar for how far you are to the next level. Click it to open your inventory.
- **Level-ups in the pop-up.** The achievement pop-up now shows the XP you gained and when you reach a new level, and every achievement card shows the XP it gave (or the 60-140 XP range while it is locked).

### Inventory
- **A new Inventory button** at the top (next to Achievements, or "Inventory" in the command palette). It shows your SteamLite level, how many streak restores you have, your current play streak (and a renewable broken streak, if you have one), and the reward themes you have earned.

### Profile
- **Hide your badges.** Edit Profile has a new "Hide the badges section on my profile" option. When it is on, your profile shows a short note instead of the badges, and you can turn it back on at any time.

### Notes
- With 40 achievements averaging 100 XP, most players will top out around level 81. Level 100 needs about 4,950 XP, so only lucky rolls and weekend boosts get close (the 8 Halloween ones can only be earned in October).

---

# SteamLite 8.4.1 Changelog

## New

### SteamLite Updater
- **A small stand-alone updater app.** `SteamLite Updater.exe` is installed in its own folder (%LOCALAPPDATA%\SteamLite Updater, separate from SteamLite so it never gets overwritten while running) and has its own window: it shows the version you have and the latest one, the release notes, a download progress bar with speed and time left, and installs the update for you.
- **Updating from SteamLite now opens the Updater.** When an update is found, "Update now" hands over to the Updater, which downloads it (and can resume a download that was interrupted), closes SteamLite, installs the update and starts SteamLite again.
- **It works even when SteamLite doesn't.** You can open it from the Start menu ("SteamLite Updater") or from the command palette ("Open SteamLite Updater"), so a broken or blocked in-app update check no longer means reinstalling by hand.
- **Uses what Windows already has.** The Updater is about 300 KB and needs nothing extra installed. It checks the same places as SteamLite (GitHub, with a fallback) and supports the Beta channel.

### Notes
- The Updater arrives with this version, so the first update to 8.4.1 still uses the old in-app updater. From 8.4.1 on, updates go through the Updater.
- If the Updater is missing for some reason, SteamLite falls back to its previous in-app update.

---

# SteamLite 8.4.0 Changelog

## New

### Halloween event (October 1 - November 1, returns every year)
- **A seasonal Halloween event.** While it's on, a banner on the dashboard shows a countdown and how many event achievements you have, you get a one-time notification when it starts, and the Achievements window has a Halloween section at the top.
- **8 Halloween achievements**, counted only from play during the event:
  - **Trick or Treat** - play a game on Halloween (October 31).
  - **Witching Hour** - start a session between 3:00 and 4:00 AM.
  - **Night Stalker** - start 5 sessions after 10 PM.
  - **Vampire Hours** - play on 7 different days.
  - **Tangled Web** - play 7 different games.
  - **Haunted Marathon** - play a single session of 3 hours or more.
  - **Graveyard Shift** - play 13 hours during the event.
  - **Spooky Season Survivor** - unlock every other Halloween achievement. Unlocks the Haunted Harvest theme and rewards 5 streak restores.
- **Haunted Harvest theme** (Theme Shop): pumpkin orange on a haunted purple night, with a glowing orange accent. It's the reward for unlocking all 8 Halloween achievements, and once you earn it, it's yours forever - even after the event ends. It ships with SteamLite like the other bundled themes.
- **Preview the theme:** the event banner has a **Preview theme** button that tries Haunted Harvest on before you've unlocked it. Nothing is saved or unlocked, and it doesn't count as applying a theme. A bar at the bottom lets you exit (or press Esc) and your own look comes straight back. If you've already earned the theme, the same bar lets you apply it.
- **Limited time:** Halloween achievements, and the Haunted Harvest theme they unlock, can only be earned until November 1. After that the event closes, the banner goes away, and the theme can no longer be unlocked (the Theme Shop says it was a limited-time event theme). Anything you earned - including the theme - stays unlocked for good.

### Sound
- **A brand new sound design.** There are now 13 distinct sounds instead of 3: clicks, windows opening and closing (they used to make the same noise), switches turning on and off, notifications, success and error messages, achievements, streaks, a game launching or stopping, and favoriting.
- **Three sound packs** (Advanced Settings -> Sound Pack, with a Preview button): **Glass** (new, the default, bright and bell-like), **Classic** (the original sounds) and **Arcade** (chiptune).
- Toasts sound like what they say: failures, confirmations and achievements each have their own sound.

### Disk usage
- **Size on disk.** Each installed game card now shows how much space it uses, and you can sort your library by size (Filters -> Sort By -> Size on disk).
- **Disk Usage widget** on the dashboard: how much your games use in total, free space on every drive that holds a Steam library, and your five biggest games.
- **Free Up Space** (Ctrl+K -> "Free Up Space", or the button on the widget): every installed game by size, with filters for "not played in 6+ months", "never played" and "over 10 GB", and a "good candidate" tag on big games you haven't touched. Uninstalling still goes through Steam's own confirmation.

### Adding games
- **Drag and drop** a program (.exe) or a Windows shortcut (.lnk) onto the window to add it as a non-Steam game. Drop several at once and pick which to add. Shortcut arguments are kept.
- **Import from Start menu:** scan your Start menu for programs and add the ones you want. Steam games, installers, uninstallers and Windows tools are left out.

### Undo
- Hiding a game (one or many), removing a game from a collection, deleting a collection and removing a non-Steam game now show an **Undo** button for a few seconds.

### Keyboard and shortcuts
- **Move around the library with the arrow keys.** Enter opens the highlighted game, F favorites it, Home and End jump to the first and last. Down from the search box drops into the grid.
- **Rebindable global hotkeys** (Advanced Settings -> Global Hotkeys): change the shortcuts for Quick Launch, the Command Palette and Stop Game. SteamLite tells you if another program already uses one.

### Settings
- **Quiet Hours:** mute notification sounds and friend pop-ups on a schedule (for example 22:00 to 08:00).
- **Keep running in the tray when closed** can now be turned off, so the close button quits SteamLite.
- **Check for updates automatically** can now be turned off.
- **Skip this version** on the update dialog: automatic checks stay quiet about that release (a manual check still shows it).
- **Quick links:** right-click a game to open its Steam Store page, SteamDB, PCGamingWiki or HowLongToBeat.

## Bug Fixes
- "Quit SteamLite" in the command palette used to just hide the window to the tray. It now really quits.
- Dropping a file onto the window no longer tries to open it inside SteamLite.

## Improvements
- Sounds that happen close together are no longer dropped. Before, one shared 150ms limit meant opening a window right after a click could be silent.
- Reverb is skipped in Potato Mode, and the sound volume slider still controls every pack.

## Known Issues
- Halloween achievements only count play from the event dates (October 1 - November 1), so sessions from before October 1 do not count.
- Free Up Space can only uninstall one game at a time, because Steam asks for confirmation on each.
- Sizes come from Steam's own install records, so they update after Steam finishes installing or updating a game (press F5 to refresh).

---

# SteamLite 8.3.6 Changelog

## Bug Fixes
- **Updates not being detected:** the "update available" message was only sent once, 3 seconds after launch, so on a slower PC it could be sent before the window had finished loading and was lost. SteamLite now holds a found update until the window is ready, retries a few times if the first check fails (for example when the network isn't up yet), and re-checks every 4 hours, so an app left running in the tray still finds new versions.
- **Missing covers on newer games:** many recently released games showed no cover image. This was a long-standing issue that goes back to at least v1.3.0 of SteamLite: Steam stores newer games' art at a different address than the one SteamLite looked up. SteamLite now falls back to Steam's store to find the real image, saves it, and remembers games that have no store page so they aren't looked up again every launch.
- A failed manual update check now says why (for example a DNS or connection error) instead of just "failed".

## Improvements
- If raw.githubusercontent.com is blocked or unreliable on your network, the update check falls back to the GitHub API.
- Hardened the cover image loader so it only accepts game IDs, never a file path.

## Known Issues
- Games with no Steam store page at all still show their name instead of a cover. You can set your own with right-click, Change Cover.
- If you're on a version older than 8.3.6 and updates aren't being detected, install 8.3.6 manually once. Updates from 8.3.6 onward will be found reliably.

---

# SteamLite 8.3.5 Changelog

## New
- **First-time setup:** a short guided setup now runs the first time you sign in - pick an accent color and game card style, choose startup and notification options, and see the shortcuts worth knowing. Every step is optional, and you can replay it any time from the command palette (Ctrl+K, then "Run Setup Again").
- **Compare with a friend:** a new Compare button on friend profiles opens a head-to-head of your libraries: games owned, total and average playtime, most played game, every game you share with who has played it more, and the games they love that you don't own yet.
- **Game News widget:** the dashboard has a new feed of the latest announcements from the games you play most. Click an item to read it, hit the refresh arrow to update it, and resize or reorder it like any other widget.
- **Appearance settings** (Advanced Settings -> Appearance, or Ctrl+K -> "Appearance"):
  - **Card styles:** Standard, Wide, Compact list, or the new Cover only (just the art, with the title appearing on hover).
  - **Card size and spacing:** sliders for how big the game cards are and how much space is between them.
  - **Fonts:** choose from several built-in options, or type the name of any font installed on your PC.
  - **UI scale:** make everything from 80% to 140% of normal size.
- **Search and animated achievements:** you can now search achievements (by name or description) in a game's Achievements tab and in the SteamLite Achievements window, with a live count of matches. Achievement lists also slide and fade into place one after another, and the animation is quicker while you type.
- **Potato Mode** (Advanced Settings) for older PCs and integrated graphics. It turns off background blurs, looping animations, the drifting background glow, background videos and blur, and card shadows; skips drawing off-screen game cards; loads cover art lazily; checks for running games every 5 seconds instead of 2; and checks friends every minute instead of every 30 seconds.

## Bug Fixes
- Fixed game tracking being able to start a new process scan before the previous one had finished, which stacked up PowerShell processes on slow PCs.

## Improvements
- Hovering a game card remembers its glow color instead of recalculating it every time.
- Cover art now loads lazily, so big libraries open faster.

## Known Issues
- Compare only works with friends whose game list is public on Steam.
- Pins, nicknames, notes, showcases, badges and stats are stored on your PC only. Other SteamLite users can't see them on your profile, and you can't see theirs.

---

# SteamLite 8.3.0 Changelog

## New

### Profile
- **Banner styles:** besides an image or GIF, your banner can now be a two-color gradient (with an angle) or a solid color.
- **Profile editor:** a new "Edit Profile" button on your own profile lets you set a tagline, pick up to 5 favourite games to showcase, choose an avatar frame (Glow, Ring, Pulse or Rainbow), and set an accent color just for your profile.
- **Badges:** your unlocked SteamLite achievements and current play streak now show on your profile.

### Friends
- **Pin friends** to the top of the list (hover a friend and click the pin, or right-click them).
- **Nicknames and private notes:** give a friend a nickname and add a note about them. Both are only visible to you, and both show on their profile too.
- **Search and sort** your friends list: by status, A-Z, or last online.
- **Hide or mute** a friend. Hidden friends disappear from the list (tick "Show hidden" to see them), and muted or hidden friends never trigger notifications.
- **Friend notifications now show their profile picture**, and you also get a "just came online" notification for friends you've pinned. Click a notification to open their profile.
- **Tidier friend profiles:** "Friends in Common" now sits on the profile banner, and the Play Together / Pin / Nickname / Note buttons have their own row, so nothing gets squeezed and the name always sits beside the profile picture.

### Library
- **Smart collections:** "Recently Played", "Unplayed Backlog" and "Most Played" appear in the sidebar and keep themselves up to date.
- **Multi-select:** click the new select button (or press Ctrl+Shift+S), pick several games, then add them to a collection, favorite them, or hide them in one go.
- **Smarter Play Next:** choose what it picks from (any installed game, unplayed games, your favorites, or the current collection) in the filters menu. It also won't pick the same game twice in a row.
- **Your sort order and filters are now remembered** between launches.

### Stats
- **This Week widget** on the dashboard: a Monday-to-Sunday playtime chart with a weekly goal you can set, plus a nudge when a game you used to love has been gathering dust.
- **Session history** in each game's window: how many sessions you've played, the average and longest, and your latest five.

### Quality of life
- **Settings backup and restore:** export your preferences, collections, favorites, friend nicknames and playtime history to a file and import them on another PC. Your API key and login are never included.
- **Start with Windows** and **Start minimized to tray** options in Advanced Settings.
- **Keyboard shortcuts:** Ctrl+1/2/3 for Home/Library/Favorites, Ctrl+F to search your library, Ctrl+Shift+F to search friends, Ctrl+, for Settings, F5 to refresh, Esc to close the top window, and Ctrl+/ for the full list.

## Bug Fixes
- Fixed saving Settings quietly replacing the in-app copy of your configuration with only the fields on that screen, which would have discarded things like friend nicknames and your profile customisation until the next restart.
- The profile editor ignores showcase games that are no longer in your library, so they can't use up one of your 5 slots invisibly.

## Known Issues
- Pins, nicknames, notes, showcases, badges and stats are stored on your PC only. Other SteamLite users can't see them on your profile, and you can't see theirs.

---

# SteamLite 8.2.2 Changelog

## Bug Fixes
- Fixed "Restart & Install" closing SteamLite and then doing nothing. The helper that was meant to open the installer after the app quit was being killed along with the app (Windows ends a child process with its parent, and a detached PowerShell can't start at all), so the installer never appeared. It now uses a helper that survives the app closing and opens the installer through Windows (including the administrator prompt) a few seconds later.

## Improvements
- Removed the old small update banner entirely. The updater page is now the single place updates are shown, from "update available" through downloading to "ready to install".
- The installer now closes any SteamLite process still running before it copies files, so upgrading can't fail with "file in use".

## Known Issues
- If you're updating from 8.2.0 or 8.2.1, the in-app updater on those versions still has the old problem, so install 8.2.2 manually once. Updates from 8.2.2 onward will open the installer correctly.

---

# SteamLite 8.2.1 Changelog

## Bug Fixes
- Fixed the update notification showing twice when an update is found — the full updater page and the small "update available / ready to install" banner appeared at the same time.

---

# SteamLite 8.2.0 Changelog

## New
- **Editable profile banner:** hover your own banner and click "Edit Banner" to pick any image or GIF from your PC, drag the preview to move the image where you want it, zoom in, adjust blur and dimming with live preview, or reset to the default avatar banner. It's saved per profile and remembered across restarts.
- **Reworked What's New screen:** a new hero header with a summary of the update, changes sorted into New / Bug Fixes / Improvements sections with staggered fade-in, and a collapsible list of previous releases. You can now reopen it any time from the command palette (Ctrl+K → "What's New") and it loads the latest changelog even if you've already seen it.

## Bug Fixes
- Fixed the in-app updater not opening the installer after SteamLite closed. The installer asks for administrator rights, and the app was starting it in a way that can't show that prompt (and was quitting before the failure was noticed). SteamLite now closes fully, then opens the installer wizard so you can finish the upgrade.

## Improvements
- The banner image picker now accepts GIF and WebP files as well as JPG and PNG.

## Known Issues
- Other players' SteamLite streaks still can't be shown on the Friends tab — streaks are stored locally on each install with no server behind them.

---

# SteamLite 8.1.4 Changelog

## Bug Fixes
- Fixed the "Friends in Common" list on a friend's profile popping in instantly with no transition — it now fades/slides in smoothly, with a slight stagger per entry.

## Improvements
- Replaced the custom installer with a proper NSIS-based setup wizard: the SteamLite icon now shows in the installer window, it asks whether to install for all users or just you, detects and offers to upgrade an existing install, and finishes with an optional "Launch SteamLite" step. Unattended installs (`/S`, used by the in-app updater) are unchanged.

## Known Issues
- Other players' SteamLite streaks can't be shown on the Friends tab — streaks are tracked entirely locally on each person's own install with no server/sync layer behind them, so there's nothing to fetch.
- The in-app auto-updater depends on a matching release actually being published to the project's GitHub repo; if none is published yet for a given version, "Update Now" will fail and a manual download is the only option. This isn't something a local code change can fix.

---

# SteamLite 8.1.3 Changelog

## Bug Fixes
- Fixed streak-recovery window expiring (or staying active) on the wrong day around month/day boundaries (e.g. Sept→Oct, or day 9→10) due to a non-zero-padded date comparison.
- Fixed "Max common friends shown" (Advanced Settings) being saved in the UI but never actually persisted — the app now remembers it across restarts.
- Fixed a memory/event-listener leak in the game detail modal where opening a game repeatedly stacked duplicate click handlers, causing achievement/news tabs to load multiple times and firing duplicate click sounds.
- Fixed a memory/input-lag leak in the UI Editor where dragging widgets kept attaching new mouse listeners to the whole app on every edit, never cleaning up old ones.
- Fixed the SteamLite "exclusive achievement" unlock toast re-appearing every time you reopened a game's SteamLite tab instead of only the first time it's earned.
- Hardened game news rendering against malformed/crafted Steam announcement content that could otherwise inject live HTML attributes into the app.
- Fixed Dashboard layout edits (resized widgets and reordered sections) not persisting — they used to reset the moment you left the Home tab and came back, or restarted the app.
- Fixed the background color (and other theme colors) resetting to default after applying a theme and restarting the app — only the accent color was actually being saved before.
- Fixed the Play button getting stuck on "Loading..." and never flipping to the red "Stop" button on PCs without `wmic.exe` (removed in newer Windows 11 builds) — the PowerShell fallback used to list running processes in the opposite column order the code expected, so a launched game's process was never actually detected as running. This also means clicking Stop now actually terminates the game process on those PCs, instead of just silently ending the session while the game kept running.
- Fixed the game modal's "⋯" menu flashing a sideways scrollbar for a split second when opened.
- Fixed the game modal and Settings menu not fading in/out when opened or closed — a leftover animation rule was silently overriding the fade and freezing modals at full opacity.

## Improvements
- General stability and security pass across the renderer.
- Optimised animations.
- Removed the redundant "News" entry from the game modal's "⋯" menu (News already has its own tab in the modal).
- Dropped the "Mango" codename from the app's title bar, window title, and tray tooltip — SteamLite now just shows its version number.
- The installer now lets you pick an install location and choose whether to create a desktop shortcut, a Start Menu shortcut, and whether to launch SteamLite after installing (unattended `/S` installs keep the previous defaults).

## Known Issues
- None

---

# SteamLite 9.0.0 (Codename: Mango) Changelog

## New
- All-new Updater page: a dedicated update flow (available → downloading → ready) with version comparison, changelog preview, and a live progress bar, replacing the old bare notification banner.
- Refreshed navigation with an animated active-tab accent indicator.

## Bug Fixes
- Fixed "Hide offline friends" (Advanced Settings) being saved but never actually applied — the Friends list now respects it.

## Improvements
- General UI polish pass across modals and update surfaces.

## Known Issues
- None

---

# SteamLite 8.1.2 Changelog

## Bug Fixes
- Fixed dashboard widget size persistence (widget sizes now properly save and restore on relaunch)
- Fixed profile banner statistics positioning (moved to top of banner for better visibility)

## Improvements
- Added 5 new themes: Cotton Candy, Desert Dusk, Emerald Dream, Lavender Haze, Obsidian Fire
- Added 5 new achievements: Dedicated Gamer, Game Master, Session Pro, Streak Legend, Theme Enthusiast
- Improved profile banner layout with stats positioned at the top
- Enhanced dashboard customization with persistent widget sizes

## Known Issues
- None

---

# SteamLite 8.1.1 Changelog

## Bug Fixes
- Fixed achievement images not displaying in game modal
- Fixed play button infinite loading loop by improving exe tracking fallback
- Fixed UI clipping between friends-in-common and account stats on profile banner
- Fixed status indicator visibility on profile pictures (now properly displayed with larger size and glow)
- Fixed Change Profile button position and name cutoff
- Fixed Add Non-Steam Game button hover color to use user's accent color

## Improvements
- Added dashboard widget size customization (resize widgets with +/- buttons)
- Added SteamLite exclusive achievements with unlock notifications
- Reworked What's New screen with modern hero section and styling
- Made Add Non-Steam Game button smaller and sleeker (48px with SVG icon)
- Improved status indicator visibility and styling on profile pictures
- Enhanced achievement display in game modal with proper images and layout

## Known Issues
- None