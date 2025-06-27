# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Deploying to Netlify

To deploy this project to Netlify, follow these steps:

1.  **Push to GitHub:** Push your project repository to GitHub.
2.  **Connect to Netlify:** In your Netlify dashboard, click "Add new site" -> "Import an existing project" and select your GitHub repository.
3.  **Configure Build Settings:** Netlify should automatically detect that this is a Next.js project. The build command should be `npm run build` and the publish directory should be `.next`. These settings are also configured in `netlify.toml`.
4.  **Add Environment Variables:** This is a crucial step. You must add your Firebase project configuration as environment variables in the Netlify UI. Go to your site's "Settings" -> "Build & deploy" -> "Environment" and add the following variables:
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`
5.  **Deploy:** Click "Deploy site". Netlify will start the build process and your site will be live shortly.
