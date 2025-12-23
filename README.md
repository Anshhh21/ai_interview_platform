# 🎯 AI Mock Interview Platform

A comprehensive AI-powered mock interview platform that provides real-time feedback on technical skills, communication, body language, and stress levels.

## ✨ Features

- 🎤 **Voice Recognition**: Answer questions naturally using speech-to-text
- 📹 **Posture Tracking**: Real-time body language analysis using TensorFlow PoseNet
- 📊 **Stress Detection**: Voice pattern analysis to detect nervousness
- 🤖 **AI-Powered Questions**: Dynamic interview questions using Google Gemini AI
- 📈 **Detailed Feedback**: Comprehensive performance analysis with improvement suggestions
- 🔥 **Firebase Integration**: Save and track your interview history
- 4️⃣ **Multiple Job Profiles**: Frontend, Backend, Full Stack, and Mobile Development

## 🚀 Tech Stack

- **Frontend**: React + Vite
- **Styling**: Tailwind CSS
- **AI**: Google Gemini API
- **Backend**: Firebase (Firestore + Storage)
- **ML**: TensorFlow.js + PoseNet
- **Voice**: Web Speech API
- **Icons**: Lucide React

## 📋 Prerequisites

- Node.js 16+ and npm
- Firebase account
- Google Gemini API key

## 🛠️ Installation

### 1. Clone & Install
```bash
# Create Vite React app
npm create vite@latest ai-interview-platform -- --template react
cd ai-interview-platform

# Install dependencies
npm install
npm install firebase lucide-react
npm install -D tailwindcss postcss autoprefixer

# Initialize Tailwind
npx tailwindcss init -p
```

### 2. Environment Setup

Create `.env` file in root:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Configure Tailwind

Update `tailwind.config.js`:
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 4. Add TensorFlow Scripts

Update `index.html`:
```html
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.11.0/dist/tf.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/posenet@2.2.2/dist/posenet.min.js"></script>
```

## 🎮 Usage
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure
```
src/
├── components/         # React components
│   ├── HomePage.jsx
│   ├── InterviewPage.jsx
│   ├── ResultsPage.jsx
│   ├── CameraView.jsx
│   ├── QuestionCard.jsx
│   ├── AnswerInput.jsx
│   └── LoadingSpinner.jsx
├── services/          # API services
│   ├── firebase.js
│   ├── geminiApi.js
│   ├── speechService.js
│   └── poseDetection.js
├── hooks/             # Custom React hooks
│   ├── useCamera.js
│   ├── useVoiceRecognition.js
│   ├── useAudioAnalysis.js
│   └── usePoseDetection.js
├── utils/             # Utility functions
│   ├── constants.js
│   └── helpers.js
├── config/            # Configuration
│   └── apiKeys.js
├── App.jsx
└── main.jsx
```

## 🔑 Getting API Keys

### Firebase:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database & Storage
4. Copy configuration from Project Settings

### Google Gemini:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key
3. Copy the key

## 🎯 Features Breakdown

### Real-time Analysis:
- ✅ Posture detection every 2 seconds
- ✅ Voice stress analysis every 500ms
- ✅ Pause detection (2+ seconds silence)
- ✅ Speech-to-text transcription

### AI Feedback:
- ✅ Technical skills assessment
- ✅ Communication score
- ✅ Confidence rating
- ✅ Body language analysis
- ✅ Specific improvement suggestions
- ✅ Weak areas identification

## 🐛 Troubleshooting

### Camera/Microphone not working:
- Allow permissions in browser settings
- Use HTTPS or localhost
- Check browser compatibility

### TensorFlow not loading:
- Ensure scripts are in `index.html`
- Check browser console for errors
- Verify CDN links are accessible

### Firebase errors:
- Verify API keys in `.env`
- Check Firestore rules (set to test mode)
- Ensure Firebase services are enabled

## 📝 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

## 📧 Support

For issues or questions, please open a GitHub issue.

---

Built with ❤️ using React, Vite, and AI
Built with ❤️ using React, Vite, and AI