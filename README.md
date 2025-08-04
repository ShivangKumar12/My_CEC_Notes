# 📚 MyCECNotes – The Ultimate Student Notes Sharing Platform

![MyCECNotes Hero](https://placehold.co/1200x600.png?text=MyCECNotes)

**MyCECNotes** is a modern, full-stack web platform built to streamline academic collaboration within college communities. It enables students to easily **share**, **explore**, and **collaborate** on study materials like notes and question papers — all in one centralized, easy-to-navigate application.

---

## 🌟 Why MyCECNotes?

### 👩‍🎓 For Students
- Instantly access relevant notes by subject, semester, and course.
- Save time with smart search & filters.
- Build a reputation by uploading high-quality study materials.

### 🏫 For Colleges
- Preserve study resources across batches and semesters.
- Encourage collaborative, peer-driven learning.

### 👨‍💻 For Admins
- Full content moderation tools.
- Control over users and uploads to ensure academic integrity.

---

## ✨ Key Features

✅ **Google Authentication** – One-click secure login for all students.  
✅ **Admin Dashboard** – Manage notes, users, reports, and metadata.  
✅ **Smart Uploading** – Upload PDFs/DOCs with complete metadata (semester, batch, subject).  
✅ **Centralized Library** – All notes and papers are browsable from one place.  
✅ **Advanced Search & Filters** – Sort by subject, semester, batch, or popularity.  
✅ **File Preview** – View PDFs directly in-app before downloading.  
✅ **Engagement Tools** – Rate, like, comment, and report content.  
✅ **Personal Dashboard** – Track and manage your own uploads.  
✅ **Mobile Responsive** – Smooth experience across devices.

---

## 🛠 Tech Stack

| Category        | Technology                      |
|----------------|----------------------------------|
| Framework       | [Next.js 15 (App Router)](https://nextjs.org/) |
| Language        | [TypeScript](https://www.typescriptlang.org/) |
| Styling         | [Tailwind CSS](https://tailwindcss.com/), [ShadCN/UI](https://ui.shadcn.com/) |
| Backend         | [Firebase (Auth, Firestore, Storage)](https://firebase.google.com/) |
| Icons           | [Lucide React](https://lucide.dev/) |
| Optional AI     | [Genkit by Firebase](https://firebase.google.com/docs/genkit) |

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js v18+
- npm / yarn / pnpm
- A Firebase Project

---

### 🧩 1. Clone & Install

```bash
git clone <repo-url>
cd <project-folder>
npm install

### 🔧 2. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new Firebase project.
2. Inside your Firebase project:
   - Click **"Web"** to register a new Web App.
   - Copy the `firebaseConfig` object that appears (you’ll need it in your `.env.local`).

3. Enable the following Firebase services:

#### ✅ Authentication:
- Go to `Build → Authentication → Get Started`.
- Under **Sign-in method**, enable:
  - Google
  - Email/Password
- Under **Settings**, add `localhost` to the list of Authorized Domains.

#### ✅ Firestore:
- Go to `Build → Firestore Database → Create Database`.
- Choose **Start in test mode** for development.

#### ✅ Storage:
- Go to `Build → Storage → Get Started`.
- Choose **Start in test mode** to allow file uploads temporarily.

---

#### 🔧 Firestore Data Setup (Required for Dropdown Filters)

Manually create the following collections in Firestore:

- `subjects`
- `semesters`
- `courses`
- `batches`

Inside each collection, add at least one document.

Example structure:

**`subjects` Collection → Document:**
```json
{
  "name": "Data Structures"
}

### 🛠️ 3. Environment Variables

Create a `.env.local` file in the root of your project and paste your Firebase Web App credentials inside it:

```env
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-auth-domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-storage-bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-msg-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

### ▶️ 4. Run Locally

Start your local development server using the command below:

```bash
npm run dev

## 🗂 Project Structure

src/
├── app/
│ ├── (main)/ → Student-facing pages (Upload, Dashboard, etc.)
│ └── admin/ → Admin Panel (Login, Manage Users/Content)
├── components/ → Shared UI components (Navbar, Cards, etc.)
│ └── ui/ → ShadCN UI-based components
├── lib/ → Firebase config & utility functions
├── providers/ → App-wide providers (e.g. AuthContext)
├── hooks/ → Custom React hooks
public/ → Static assets (e.g. favicon, images)

## 🔒 Admin Panel

🔗 **URL**: `/admin`  
🔐 **Login**: Use the admin email/password created in Firebase.

### 👨‍💼 What Admins Can Do

✅ View and delete uploaded notes and question papers  
✅ Moderate reported content (fake/inappropriate)  
✅ Manage user profiles and assign admin privileges  
✅ Add or update filter metadata like:
- Subjects  
- Semesters  
- Courses  
- Batches
---

## 👨‍💻 Built With ❤️ by Shivang Kumar, Shiv Pratap Singh Chauhan

This project was designed and developed within **Firebase Studio**, aiming to deliver a clean, scalable, and student-focused experience.

> _"Empowering students through collaborative learning."_
