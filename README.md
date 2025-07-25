# Mallu Vandi - Used Car Dealership Platform

Welcome to Mallu Vandi, a comprehensive, feature-rich web application for a used car dealership based in Kerala, India. This platform is designed to streamline the process of buying and selling pre-owned vehicles, with dedicated dashboards for various user roles and AI-powered features to enhance user experience.

## Key Features

- **Multi-Role User System**: Differentiated dashboards and permissions for various user roles:
  - **Customer**: Browse, search, save, and inquire about car listings.
  - **Content Editor (Employee-A)**: Manages car listings, uploads images, and submits them for approval.
  - **Sales & Support (Employee-B)**: Handles customer inquiries, uses an AI assistant to answer queries, and manages follow-ups.
  - **Manager / Admin**: Oversees all operations, including approving listings, managing users, and viewing system-wide analytics.

- **Advanced Car Listings**: 
  - Detailed car information including specifications, images, and pricing.
  - Powerful search and filtering capabilities based on brand, model, year, price range, and more.
  - Users can save their favorite cars for later viewing.

- **AI-Powered Assistance**:
  - **AI Chatbot**: A public-facing AI assistant to help customers find cars and answer their questions.
  - **AI Car Summary**: Automatically generates concise summaries of car details for sales staff.
  - **AI Query Assistant**: Helps sales staff quickly answer complex customer questions about financing, taxes, and car features.

- **Admin & Management Dashboards**:
  - Analytics overview of total listings, pending approvals, and active inquiries.
  - User management system to add, edit, and manage staff and customer accounts.
  - A system for approving or rejecting new car listings submitted by content editors.
  - Inquiry management to track and re-assign customer leads.

## Tech Stack

This project is built with a modern, robust, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Component Library**: [ShadCN UI](https://ui.shadcn.com/)
- **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit)
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication, Firestore, Realtime Database, Storage)

## Getting Started

Follow these instructions to get a local copy of the project up and running.

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- `npm` or `yarn`

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/malluvandi.git
cd malluvandi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Firebase

This project requires a Firebase project to handle authentication, data storage, and AI functionalities.

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  In your new project, create a new Web App.
3.  After creating the app, Firebase will provide you with a `firebaseConfig` object. You will need these values for your environment variables.
4.  Enable the following services in the Firebase Console:
    - **Authentication**: Enable the Email/Password sign-in method.
    - **Firestore Database**: Create a new Firestore database.
    - **Realtime Database**: Create a new Realtime Database.
    - **Storage**: Create a new Storage bucket.

### 4. Configure Environment Variables

Create a file named `.env` in the root of the project and add your Firebase configuration details:

```env
# Firebase Public Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_DATABASE_URL=your_database_url
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 5. Run the Development Server

Now you can start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## Deployment

This project is configured for easy deployment on platforms like Vercel or Netlify.

- **Environment Variables**: Ensure you add all the `.env` variables from the previous step to your hosting provider's environment variable settings.
- **Build Command**: `npm run build`
- **Publish Directory**: `.next`

For detailed instructions on deploying to Netlify, refer to the `netlify.toml` file and the official [Netlify documentation for Next.js](https://docs.netlify.com/frameworks/next-js/overview/).
