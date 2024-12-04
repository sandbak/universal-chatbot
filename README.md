# Universal Chatbot

A web application that provides a chatbot interface powered by a Large Language Model (LLM). Users can register, log in, start new chat sessions, and manage their conversations.

## Features

- User Authentication (Firebase)
- Real-time Chat Interface
- Multi-language Support
- Chat Session Management
- Responsive Design

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Firebase Account
- LLM API Key (e.g., OpenAI, Anthropic, or Google Vertex AI)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a Firebase project and enable Authentication and Firestore

4. Create a `.env` file in the root directory with your Firebase and LLM API configurations:
   ```
   REACT_APP_FIREBASE_API_KEY=your_api_key_here
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
   REACT_APP_FIREBASE_APP_ID=your_app_id_here
   REACT_APP_LLM_API_KEY=your_llm_api_key_here
   ```

5. Start the development server:
   ```bash
   npm start
   ```

## Available Scripts

- `npm start`: Runs the app in development mode
- `npm test`: Launches the test runner
- `npm run build`: Builds the app for production
- `npm run eject`: Ejects from Create React App

## Project Structure

```
src/
  ├── components/      # React components
  │   ├── Auth/       # Authentication components
  │   └── Chat/       # Chat interface components
  ├── contexts/       # React contexts
  ├── services/       # Firebase and API services
  ├── i18n/          # Internationalization
  └── utils/         # Utility functions
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
