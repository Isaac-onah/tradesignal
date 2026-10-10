# TradeSignal

TradeSignal is an Expo app that signs you in with Supabase, loads crypto prices from Binance, and shows a simple moving-average signal for each pair. If a watchlist pair is a buy or a sell, the app schedules a local notification.

## What you need

- Node.js 20.19 or newer
- npm
- For the iOS simulator: macOS with Xcode **26.4 or newer**, plus the iOS Simulator runtime
- For a physical iPhone: the same Xcode version and a free Apple ID is enough for a local development build
- A [Supabase](https://supabase.com) project with email sign-up enabled

Xcode 26.3 fails while compiling `expo-modules-jsi`. Upgrade Xcode before `npm run ios`. Expo Go can open the screens, but local notifications are not fully supported there, so use a development build when you want to check alerts.

## 1. Install dependencies

```bash
npm install
```

## 2. Add environment variables

Create a `.env` file in the project root. Expo only reads variables that start with `EXPO_PUBLIC_`.

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_BINANCE_ENDPOINT=https://api.binance.com
```

Use the project URL and the **anon** key from the Supabase dashboard. Do not put the service-role key in this file. The Binance line is optional; the app uses `https://api.binance.com` when it is missing.

Restart Metro after changing `.env`. The file is gitignored.

In Supabase, open Authentication and allow email sign-ups. If “Confirm email” is on, open the confirmation message before logging in.

## 3. Run the app

### iOS simulator (use this to test notifications)

```bash
npm run ios
```

The first run generates the `ios/` project, compiles it, installs TradeSignal on a simulator, and starts Metro. Later JavaScript changes reload without another native build.

### Android emulator or device

Start an emulator, or plug in a device with USB debugging on, then:

```bash
npm run android
```

### Web or Expo Go

```bash
npm start
```

Then press `w` for web, or scan the QR code with Expo Go. Web and Expo Go are fine for login and the signal list. Notifications only run in the iOS or Android development build from the commands above.

## 4. Try a notification

1. Sign up or log in.
2. Allow notifications when the simulator or device asks.
3. Open the signals screen. Bitcoin and Ethereum start on the watchlist.

A banner appears about one second later when one of those pairs is **BUY** or **SELL**. A **NEUTRAL** reading does not notify. The same signal is not sent again. If permission was denied, the screen says notifications are off.

Change the watchlist from the profile screen. The feed always loads Bitcoin, Ethereum, BNB, Solana, and XRP.

## When something fails

**Login says the app cannot connect.** `.env` is missing, the names are wrong, or Metro was not restarted after you saved the file.

**`npm run ios` stops in `RuntimeScheduler.h`.** The installed Xcode is older than 26.4. Install a newer Xcode from the Mac App Store or [Apple’s developer downloads](https://developer.apple.com/download/), then run `sudo xcode-select -s /Applications/Xcode.app` and `npm run ios` again.

**Expo Go warns about `expo-notifications`.** That is expected. Quit Expo Go and use `npm run ios` or `npm run android`.

**The native project looks stale after an `app.json` or native-package change.** Generate it again, then rebuild:

```bash
npx expo prebuild --clean
npm run ios
```

`ios/` and `android/` are generated. Do not edit them by hand.
