# NoteVault: Student Notes Sharing Platform

![NoteVault Hero Image](https://placehold.co/1200x600.png?text=NoteVault)

**NoteVault** is a modern, full-stack web application designed to be a centralized hub for students to share, discover, and collaborate on study materials. It provides an intuitive and robust platform for uploading notes and past question papers, making academic resources more accessible to everyone in the college community.

---

## 🌟 Benefits

-   **For Students**: Easily find study materials for any subject or semester, reducing study time and improving grades. Get feedback on your own notes and build a reputation as a helpful peer.
-   **For the College Community**: Fosters a collaborative learning environment. Preserves valuable academic resources from one year to the next, creating a lasting knowledge base.
-   **For Administrators**: Provides full control over the platform's content and users, ensuring quality and safety with powerful moderation tools.

---

## ✨ Core Features

-   **Google Authentication**: Secure and easy login for students using their Google accounts.
-   **Dedicated Admin Panel**: A separate, password-protected dashboard for administrators to manage all content, users, and site metadata.
-   **Content Upload**:
    -   Users can upload notes and question papers in PDF or DOC/DOCX format.
    -   Detailed metadata including subject, semester, course, and batch can be added.
-   **Centralized Library**: Browse all uploaded materials in a unified library, with separate sections for notes and question papers.
-   **Advanced Search & Filtering**:
    -   Full-text search by title or keyword.
    -   Filter content by subject, semester, course, and batch.
    -   Sort notes by popularity (highest rated, most liked, most downloaded).
    -   Filter question papers by type (PTU, MST1, MST2).
-   **File Preview & Download**: In-app PDF preview and direct download functionality for all materials.
-   **Community Feedback & Moderation**:
    -   **Ratings**: A 1-5 star rating system for each note.
    -   **Likes/Dislikes**: A simple voting system to gauge content quality.
    -   **Comments**: A discussion section on each note's preview page for users to leave feedback.
    -   **Reporting**: Users can report fake or inappropriate content, which is then flagged for admin review.
-   **User Dashboard**: A personalized dashboard for users to view and manage their own uploaded content.
-   **Responsive Design**: A fully responsive interface that works seamlessly on desktops, tablets, and mobile devices.

---

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

---

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
2.  **Create a Web App**: Inside your project, add a new Web App. When prompted, copy the `firebaseConfig` object.
3.  **Enable Services**:
    -   **Authentication**:
        -   Go to **Build > Authentication** and click "Get started".
        -   In the "Sign-in method" tab, enable both `Google` and `Email/Password` providers.
        -   Under "Settings", add `localhost` to the list of authorized domains for testing.
    -   **Firestore**:
        -   Go to **Build > Firestore Database** and click "Create database".
        -   Start in **test mode** for development. This allows open read/write access.
    -   **Storage**:
        -   Go to **Build > Storage** and click "Get started".
        -   Start with the default test rules.
4.  **Create Initial Data (Required for Filters)**:
    - In Firestore, you need to manually create collections for the filter dropdowns to work.
    - Create the following collections: `subjects`, `semesters`, `courses`, and `batches`.
    - Inside each collection, add a few sample documents. For example, in `subjects`, add a document with a field `name` set to "Data Structures". In `semesters`, add a document with a field `value` set to `1` (as a number).
5.  **Create Admin User & Permissions**:
    - Go back to **Authentication** and click **Add user**.
    - Create a user with an email (e.g., `admin@mycecnotes.com`) and a password.
    - **Copy the User UID** for this new user.
    - Go to the **Firestore Database** and select the `users` collection.
    - Click **Add document**. In the **Document ID** field, **paste the User UID** you copied.
    - Add a field named `isAdmin` of type `boolean` and set it to `true`.
    - You can also add other fields like `name` and `email` to complete the profile.

### 4. Set Up Environment Variables

Create a `.env.local` file in the root of the project. Paste your Firebase web app configuration into it.

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

---

## 📂 Project Structure

-   `src/app/`: Contains all the pages and routing logic for the Next.js App Router.
    -   `(main)/`: Routes for the main user-facing application (notes, upload, dashboard).
    -   `admin/`: Routes for the admin panel.
-   `src/components/`: Shared React components used throughout the application (e.g., `Header`, `Footer`, `NoteCard`).
    -   `ui/`: Components from the ShadCN/UI library.
-   `src/lib/`: Core utilities and configuration.
    -   `firebase.ts`: Firebase initialization and configuration.
    -   `types.ts`: TypeScript type definitions for data models.
-   `src/providers/`: React Context providers for managing global state (e.g., user authentication).
-   `src/hooks/`: Custom React hooks for shared logic.
-   `public/`: Static assets.

---

## 🔒 Admin Panel

-   **URL**: `/admin`
-   **Login**: Use the credentials you created in Step 5 of the Firebase setup.

The admin panel allows for complete management of:
-   All uploaded notes and question papers.
-   Content reported by users.
-   All registered users.
-   Metadata used in filters (Subjects, Semesters, Courses, Batches).

---

This project was built within Firebase Studio.
