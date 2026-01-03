# Corporate Chaos

**Corporate Chaos** is a satirical choice-based mobile game built with React Native and Expo. Navigate the absurdities of corporate life, make questionable decisions, and see if you can survive the daily grind or get fired in spectacular fashion.

## 🚀 Features

- **Choice-Driven Gameplay**: Every decision impacts your stats (Sanity, Budget, Productivity).
- **Multiple Endings**: Discover various career outcomes based on your performance.
- **Daily Standup**: A daily challenge mode to test your corporate survival skills.
- **Achievements**: Unlock badges for your "accomplishments".
- **Boss Button**: Quickly hide the game with a fake spreadsheet screen.
- **Ads & IAP**: Optional rewarded ads and in-app purchases for "Coffee Tokens" (Monetization simulation).

## 🛠 Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Routing**: [Expo Router](https://docs.expo.dev/router/introduction/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Persistence**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Ads**: React Native Google Mobile Ads

## 🏁 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/xDevsub/Corporate_Chaos.git
    cd Corporate_Chaos
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the App

Start the development server:

```bash
npx expo start
```

- **Scan the QR code** with the Expo Go app on your Android or iOS device.
- Press `a` to open in Android Emulator.
- Press `i` to open in iOS Simulator.
- Press `w` to open in Web.

## 🧪 Testing

Run the test suite:

```bash
npm test
```

## 📂 Project Structure

- `app/`: Expo Router screens and layout.
- `src/components/`: Reusable UI components.
- `src/stores/`: Zustand state management.
- `src/utils/`: Helper functions (Analytics, Ads, Audio).
- `src/data/`: Game data and scenarios.
- `assets/`: Images and audio files.

## 📄 License

This project is licensed under the MIT License.

