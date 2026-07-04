
// IMPORTANT: FOR LOCAL DEVELOPMENT ONLY
// This file simulates server-side environment variables for the browser.
//
// 1. Replace "YOUR_GOOGLE_CLIENT_ID_HERE" with the Client ID from your Google Cloud project.
//    This is required for the "Sign in with Google" button to work.
//
// The app no longer uses a default GEMINI_API_KEY. Each user must provide their own.
//
// DO NOT commit this file to a public repository or share it.

window.process = {
  env: {
    GOOGLE_CLIENT_ID: '291534906139-8cl3q025p0ibn2qio91d3mos2f2tkgs4.apps.googleusercontent.com',
  }
};
