# 🌳 Arbors Focus: Gamified Pomodoro & Task Manager

Arbors Focus is a "World Class" productivity suite built with **React Native** and **Expo**. It combines the scientifically proven **Pomodoro Technique** with a charming **tree-growth gamification engine** to help you stay focused, organized, and motivated.

---

## 🚀 Vision
Most productivity apps feel like work. Arbors Focus feels like a game. Every task you finish and every focus session you complete provides nutrients to your digital tree, helping it evolve from a tiny sprout into an ancient oak.

---

## ✨ Key Features

### 🎮 Gamification Engine
- **Tree Visualization**: A dynamic SVG tree that visually grows as you earn XP.
- **Leveling System**: Earn "Growth Points" and XP for every minute you focus.
- **Achievements & Badges**: Unlock 7+ unique badges like "Deep Focus" and "Forest Guardian."
- **Daily Activity Feed**: A chronological log of every milestone you've reached.

### 📋 Kanban Task Board
- **Professional Workflow**: Organize tasks into customizable sections (Todo, In Progress, Done).
- **Interactive UX**: Full support for **Drag & Drop** sorting and **Swipe-to-Move** gestures.
- **Smart Payouts**: Reward points are calculated based on the effort (Pomodoros) spent on each task.

### ⏱️ Advanced Pomodoro Timer
- **Triple Mode**: Support for Focus (25m), Short Break (5m), and Long Break (15m).
- **Tactile Feedback**: Integrated **Haptic Vibrations** for a premium physical feel.
- **Customizable**: Adjustable session lengths via the Settings dashboard.

### 📊 Productivity Dashboard
- **Weekly Workload Analytics**: Animated bar charts showing your session trends over the last 7 days.
- **Data Integrity**: Powered by local device persistence via `AsyncStorage`.

### 🎨 Design & Accessibility
- **Automatic Dark Mode**: A stunning, high-contrast dark theme for night-time focus.
- **Haptic Feedback**: Subtle physical responses for every button tap and task completion.
- **Adaptive UI**: Optimized layouts for both iOS and Android.

---

## 🛠️ Technical Stack

- **Framework**: [Expo](https://expo.dev/) (React Native)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based navigation)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Persistence & Middleware)
- **Animations**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) & [Animated API](https://reactnative.dev/docs/animated)
- **Storage**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- **Visuals**: [Expo Vector Icons](https://icons.expo.fyi/) & Custom SVGs

---

## 📦 Installation & Setup

1. **Clone the repository**:
   ```bash
   git clone [your-repo-url]
   cd pomodoro-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npx expo start
   ```

4. **Run on your device**:
   - Download the **Expo Go** app on iOS or Android.
   - Scan the QR code generated in your terminal.

---

## 📝 Exam Submission Highlights
- **Performance**: Zero-latency global state updates with Zustand.
- **Robustness**: Advanced "Hydration" checks ensure settings are never lost after a crash.
- **Code Quality**: Modular architecture with reusable custom Hooks (`useNotifications`, `useAppTheme`).
- **User Experience**: Consistent use of Haptics and Micro-animations to drive engagement.

---

Created with ❤️ for the Advanced Development Exam.
