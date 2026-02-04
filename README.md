# 🏋️ Iron Protocol

A progressive overload fitness tracker with smart auto-regulation. Built with React.

![Iron Protocol](https://img.shields.io/badge/version-1.0.0-red)
![React](https://img.shields.io/badge/React-18-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

### 🎯 Smart Training
- **Progressive Overload** - Automatic weight/rep progression based on RPE
- **Double Progression** - Increase reps within range, then add weight
- **Auto-Regulation** - RPE 10 reduces weight, incomplete workouts auto-adjust
- **Deload Reminders** - Suggests deload week every 4 weeks

### 📊 Tracking
- **Workout History** - Full session logs with volume tracking
- **Exercise Graphs** - Visual weight progression over time
- **Personal Records** - Automatic 1RM estimation and PR tracking
- **Body Measurements** - Track weight, body fat, and measurements

### 🍽️ Nutrition
- **Water Tracking** - Daily hydration goals
- **Protein Tracking** - Quick-log common protein sources
- **7-Day History** - Visual nutrition trends

### ⚡ Quick Workouts
- **Bodyweight Circuits** - 15-25 minute no-equipment workouts
- **Work/Rest Timers** - Guided interval training
- **Multiple Templates** - Full body, upper, lower, core, HIIT

### 🎨 User Experience
- **Dark Mode** - Easy on the eyes
- **Rest Timer** - With sound and vibration alerts
- **YouTube Integration** - Exercise demonstration videos
- **Warm-up Calculator** - Auto-generated warm-up sets

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/iron-protocol.git

# Navigate to project
cd iron-protocol

# Install dependencies
npm install

# Start development server
npm start
```

The app will open at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 📱 Usage

1. **Onboarding** - Enter your stats (height, weight, experience level)
2. **Choose Template** - PPL, Upper/Lower, Full Body, or Bro Split
3. **Start Workout** - Complete sets and rate difficulty (RPE 6-10)
4. **Track Progress** - View stats, PRs, and trends in the dashboard

### RPE Scale
| RPE | Meaning | Effect |
|-----|---------|--------|
| 6 | Easy | +1 rep next time |
| 7 | Moderate | +1 rep next time |
| 8 | Hard | +1 rep (or +weight if at max reps) |
| 9 | Very Hard | No change |
| 10 | Failed | Reduce weight |

## 🛠️ Tech Stack

- **React 18** - UI framework
- **LocalStorage** - Data persistence
- **Web Audio API** - Rest timer sounds
- **Vibration API** - Mobile haptic feedback

## 📁 Project Structure

```
iron-protocol/
├── public/
│   └── index.html
├── src/
│   ├── App.jsx          # Main application component
│   ├── index.js         # Entry point
│   └── index.css        # Global styles
├── package.json
└── README.md
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Exercise data and YouTube links curated for proper form
- Inspired by proven strength training methodologies
- Built with Claude AI assistance

---

**Start your strength journey today! 💪**
