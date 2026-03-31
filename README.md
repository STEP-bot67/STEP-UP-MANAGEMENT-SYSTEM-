# SMS STEP UP - Student Management System

A modern, secure Student Management System.

## Deployment to Netlify via GitHub

To deploy this application to Netlify, follow these steps:

1.  **Push to GitHub:**
    -   Create a new repository on GitHub.
    -   Initialize your local repository: `git init`
    -   Add all files: `git add .`
    -   Commit your changes: `git commit -m "Initial commit"`
    -   Link to your GitHub repository: `git remote add origin <your-github-repo-url>`
    -   Push to GitHub: `git push -u origin main`

2.  **Connect to Netlify:**
    -   Log in to your [Netlify account](https://app.netlify.com/).
    -   Click **"Add new site"** > **"Import an existing project"**.
    -   Select **GitHub** as your provider.
    -   Authorize Netlify and select the `sms-step-up` repository.

3.  **Configure Build Settings:**
    -   **Build command:** `npm run build`
    -   **Publish directory:** `dist`
    -   **Base directory:** (Leave empty unless your project is in a subdirectory)

4.  **Environment Variables (Optional):**
    -   If you use any environment variables (like `GEMINI_API_KEY`), add them in the Netlify dashboard under **Site settings** > **Environment variables**.

5.  **Deploy:**
    -   Click **"Deploy site"**. Netlify will build and deploy your application automatically.

## Features

-   **Secure Login:** Access code-protected entry.
-   **Dashboard:** Real-time statistics and financial overview.
-   **Student Management:** Track registrations, fees, and contributions.
-   **Financial Tracking:** Manage expenses and reconciled balances.
-   **PDF Reports:** Generate and export financial summaries.
-   **Digital Clock:** Live system time and date.

## Local Development

1.  Install dependencies: `npm install`
2.  Start the development server: `npm run dev`
3.  Build for production: `npm run build`
