
import type { Timestamp } from 'firebase/firestore';

export interface UserProfile {
  id: string; // Corresponds to Firebase Auth UID
  name: string;
  email: string;
  avatarUrl: string;
  isAdmin?: boolean;
  noteCount?: number;
}

export interface Feedback {
  id:string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  rating: number;
  comment?: string;
  createdAt: Date | Timestamp;
}

export interface Answer {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  text: string;
  upvotes: number;
  createdAt: Date | Timestamp;
}

export interface Question {
  id: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string;
  };
  question: string;
  answers: Answer[];
  createdAt: Date | Timestamp;
}

export interface Note {
  id: string;
  title: string;
  category: 'note' | 'questionPaper';
  paperType?: 'PTU' | 'MST1' | 'MST2' | null;
  subject: string;
  semester: number;
  course: string;
  batch: string;
  uploader: {
    id: string;
    name: string;
    avatarUrl: string;
  } | UserProfile;
  fileUrl: string;
  fileType: 'pdf' | 'doc' | 'docx';
  thumbnailUrl: string;
  likes: number;
  dislikes: number;
  likedBy: string[];
  dislikedBy: string[];
  averageRating: number;
  ratingsCount: number;
  downloads: number;
  feedback: Feedback[];
  qna: Question[];
  reportedBy: string[];
  reportsCount: number;
  createdAt: Date & Timestamp;
}
