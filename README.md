
# NoteVault: Student Notes Sharing Platform

NoteVault is a modern, full-stack web application designed to be a centralized hub for students to share, discover, and collaborate on study materials. It provides a platform for uploading notes and past question papers, making academic resources more accessible to everyone in the college community.

The application features a clean, intuitive interface, robust filtering and search capabilities, and a community-driven rating and feedback system.

## ✨ Core Features

-   **Google Authentication**: Secure and easy login for students using their Google accounts.
-   **Dedicated Admin Panel**: A separate, password-protected dashboard for administrators to manage all content, users, and site metadata.
-   **Note & Question Paper Upload**: Users can upload study materials in PDF or DOC/DOCX format, complete with metadata like subject, semester, course, and batch.
-   **Centralized Library**: Browse all uploaded notes and question papers in a unified library.
-   **Advanced Search & Filtering**:
    -   Full-text search by title or keyword.
    -   Filter content by subject, semester, course, and batch.
    -   Sort notes by popularity (highest rated, most liked, most downloaded).
    -   Filter question papers by type (PTU, MST1, MST2).
-   **File Preview & Download**: In-app PDF preview and direct download functionality for all materials.
-   **Community Feedback System**:
    -   **Ratings**: A 1-5 star rating system for each note.
    -   **Likes/Dislikes**: A simple voting system to gauge content quality.
    -   **Comments**: A discussion section on each note's preview page for users to leave feedback and start conversations.
-   **User Dashboard**: A personalized dashboard for users to view and manage their own uploaded content.
-   **Responsive Design**: A fully responsive interface that works seamlessly on desktops, tablets, and mobile devices.

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI Library**: [React](https://reactjs.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Component Library**: [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend & Database**: [Firebase](https://firebase.google.com/)
    -   **Authentication**: Firebase Authentication (Google Provider & Email/Password)
    -   **Database**: Firestore
    -   **Storage**: Cloud Storage for Firebase
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **AI (Optional)**: [Genkit](https://firebase.google.com/docs/genkit) (Configured for future AI features)

## 🚀 Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18 or later)
-   [npm](https://www.npmjs.com/) (or yarn/pnpm)
-   A [Firebase](https://firebase.google.com/) project.

### 1. Clone the Repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Install Dependencies

Install all the necessary packages for the project.

```bash
npm install
```

### 3. Firebase Setup

This project requires a Firebase backend to function.

1.  **Create a Firebase Project**: Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Create a Web App**: Inside your project, add a new Web App and copy the `firebaseConfig` credentials.
3.  **Enable Services**:
    -   **Authentication**: Enable `Google` and `Email/Password` sign-in providers. Add `localhost` to the list of authorized domains.
    -   **Firestore**: Create a new Firestore database. Start in **test mode** for development.
    -   **Storage**: Create a new Cloud Storage bucket. Start with the default test rules.
4.  **Create Initial Data**: In Firestore, create collections for `subjects`, `semesters`, `courses`, and `batches` and add a few sample documents to each so the dropdown menus work.
5.  **Create Admin User**: In Firebase Authentication, create an admin user with the email `admin@mycecnotes.com` and password `admin123`. Copy the generated UID and create a corresponding document in a `users` collection in Firestore with an `isAdmin` field set to `true`.

### 4. Set Up Environment Variables

Create a `.env.local` file in the root of the project and add your Firebase credentials.

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

### 5. Run the Project

Start the local development server.

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

## 📂 Project Structure

-   `src/app/`: Contains all the pages and routing logic for the Next.js App Router.
    -   `(main)/`: Routes for the main application (notes, upload, dashboard).
    -   `admin/`: Routes for the admin panel.
-   `src/components/`: Shared React components used throughout the application (e.g., `Header`, `Footer`, `NoteCard`).
    -   `ui/`: Components from the ShadCN/UI library.
-   `src/lib/`: Core utilities and configuration.
    -   `firebase.ts`: Firebase initialization and configuration.
    -   `types.ts`: TypeScript type definitions for data models.
-   `src/providers/`: React Context providers for managing global state (e.g., user authentication).
-   `src/hooks/`: Custom React hooks.
-   `public/`: Static assets.

## 🔒 Admin Panel

-   **URL**: `/admin`
-   **Login Credentials**:
    -   **Email**: `admin@mycecnotes.com`
    -   **Password**: `admin123`

The admin panel allows for the management of all users, notes, question papers, subjects, semesters, courses, and batches.

---

This project was built within Firebase Studio.
