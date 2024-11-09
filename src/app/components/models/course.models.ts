/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CourseItem {
  id: string;
  name: string;
  overview: string;
  image: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  isNew: boolean;
  tags: string[];
  progress?: any;
}

export interface ChapterItem {
  title: string;
  subtitle?: string; // Optional if not all chapters have a subtitle
  overview?: string; // Optional if not all chapters have an overview
  topics: TopicItem[];
}

export interface TopicItem {
  title: string;
  quiz?: boolean; // Indicates if this topic includes a quiz
  content: string;
}
