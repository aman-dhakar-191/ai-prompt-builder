# AI Prompt Builder

A modern React application for generating and validating AI system instructions using OpenRouter models.

## Features

- **Generate System Instructions**: Describe your desired AI output and get professionally crafted system instructions
- **Validate with Test Prompts**: Test your system instructions with sample prompts and get detailed analysis
- **Score Tracking**: See improvement scores in the header showing if your prompt is getting better
- **Firebase Persistent Storage**: Store API keys and history using Firebase Realtime Database
- **Export Results**: Export your prompts and test results as JSON or Markdown
- **Test Prompt Tab**: Interactive testing area to try your prompts with any scenario
- **Public Prompts Showcase**: Browse and use community-shared prompts (no login required)
- **Share Prompts**: Publish your refined prompts for others to use and improve
- **Code Export**: Toggle to view API integration code for your prompts
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Feedback**: Instant validation and scoring of your prompts

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase** - Realtime Database for persistent storage
- **OpenRouter API** - Access to multiple AI models

## Setup

### Prerequisites

- Node.js 18+ installed
- OpenRouter API key (get one at [openrouter.ai/keys](https://openrouter.ai/keys))
- (Optional) Firebase project for persistent storage

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/aman-dhakar-191/ai-prompt-builder.git
   cd ai-prompt-builder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure Firebase:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Firebase credentials
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Firebase Configuration

### Setting up Firebase Realtime Database

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable Realtime Database:
   - Go to Build → Realtime Database
   - Create database
   - Start in test mode (configure security rules for production)

3. Get your config:
   - Go to Project Settings → General
   - Scroll to "Your apps" and click the web icon (</>) to create a web app
   - Copy the configuration values

4. Create `.env.local` with your Firebase credentials:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

### Database Structure

The app organizes data in Firebase Realtime Database as follows:

```
/
├── users/
│   └── {deviceId}/
│       ├── settings/
│       │   └── apiKey
│       └── history/
│           └── {historyId}
└── publicPrompts/
    └── {promptId}
```

## Firebase Deployment

### Setup Firebase Hosting

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Update `.firebaserc` with your project ID

4. Deploy manually:
   ```bash
   npm run build
   firebase deploy
   ```

### GitHub Actions Deployment

To enable automatic deployment on push to main:

1. Generate a Firebase service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"

2. Add the following secrets to your GitHub repository:
   - `FIREBASE_SERVICE_ACCOUNT`: The contents of your service account JSON file
   - `FIREBASE_PROJECT_ID`: Your Firebase project ID
   - (For Firebase config in production) Add `VITE_FIREBASE_*` environment variables to your build

3. Push to the `main` branch to trigger automatic deployment

## Usage

### Prompt Builder Tab

1. **Enter API Key**: Input your OpenRouter API key in the designated field

2. **Generate Instructions**: 
   - Describe your desired AI output
   - Optionally add context or constraints
   - Click "Generate System Instructions"

3. **Review & Edit**: 
   - Review the generated instructions
   - Edit if needed

4. **Validate**: 
   - Enter a test prompt
   - Describe expected behavior
   - Click "Validate" to test

5. **Export/Share**: 
   - Use Export to save as JSON or Markdown
   - Use Share to publish to the public showcase

### Test Prompt Tab

- Test your generated system prompt with any input
- Toggle "Show Code" to see API integration code
- Copy the code to use in your own projects

### Public Prompts Tab

- Browse community-shared prompts
- Filter by score, date, or refinements
- Use a prompt to start with a proven template
- Refine a prompt to create an improved version

## Models Used

- **Generator Model**: Google Gemini 2.0 Flash - Generates system instructions
- **Validator Model**: Google Gemini 2.0 Flash - Validates instructions with test data
  

Both models can be changed from the Model Selection dropdown.

## License

MIT
