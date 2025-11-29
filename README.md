# AI Prompt Builder

A modern React application for generating and validating AI system instructions using OpenRouter models.

## Features

- **Generate System Instructions**: Describe your desired AI output and get professionally crafted system instructions
- **Validate with Test Prompts**: Test your system instructions with sample prompts and get detailed analysis
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Feedback**: Instant validation and scoring of your prompts

## Tech Stack

- **React 19** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **OpenRouter API** - Access to multiple AI models

## Setup

### Prerequisites

- Node.js 18+ installed
- OpenRouter API key (get one at [openrouter.ai/keys](https://openrouter.ai/keys))

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

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Firebase Deployment

### Setup Firebase

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

3. Login to Firebase:
   ```bash
   firebase login
   ```

4. Update `.firebaserc` with your project ID

5. Deploy manually:
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

3. Push to the `main` branch to trigger automatic deployment

## Usage

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

5. **Copy**: Use the copy button to copy instructions to your clipboard

## Models Used

- **Generator Model**: Google Gemini 2.0 Flash - Generates system instructions
- **Validator Model**: Google Gemini 2.0 Flash - Validates instructions with test data

## License

MIT
