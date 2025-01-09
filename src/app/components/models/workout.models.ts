/* eslint-disable @typescript-eslint/no-explicit-any */
export interface WorkoutItem {
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
