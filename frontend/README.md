# Bill Split — Frontend (Vite + React)

This is a minimal frontend scaffold for the Bill Split app. It includes a login page with Firebase Authentication (email/password and Google sign-in).

## Quick start

1. Install dependencies

   ```bash
   cd frontend
   npm install
   ```

2. Create a Firebase project and enable Authentication providers (Email/Password and Google). Then add a Web app and copy the config values.

3. Create a `.env` file in `frontend/` with the following variables (replace the placeholders with your Firebase values):

   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. Run the dev server

   ```bash
   npm run dev
   ```

5. Open http://localhost:5173/login

## Notes

- This is intentionally minimal — authentication helpers live in `src/firebase/`, the login UI is `src/pages/Login.jsx`.
- After sign-in you'll see a minimal signed-in state; later we can add protected routes, user context, and a real app shell.

## Next steps (suggested)

- Add a global auth provider to persist user state.
- Add a simple dashboard and ability to create/join bills.
- Add tests and CI.
