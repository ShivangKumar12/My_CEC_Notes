export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Feedback {
  id: string;
  user: User;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface Answer {
  id: string;
  user: User;
  text: string;
  upvotes: number;
  createdAt: Date;
}

export interface Question {
  id: string;
  user: User;
  question: string;
  answers: Answer[];
  createdAt: Date;
}

export interface Note {
  id: string;
  title: string;
  subject: string;
  semester: number;
  uploader: User;
  fileUrl: string;
  fileType: 'pdf' | 'doc';
  likes: number;
  dislikes: number;
  averageRating: number;
  ratingsCount: number;
  downloads: number;
  feedback: Feedback[];
  qna: Question[];
  createdAt: Date;
}
