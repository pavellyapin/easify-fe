/* eslint-disable @typescript-eslint/no-explicit-any */
export interface RecipeItem {
  id: string;
  name: string;
  description: string;
  cuisine: string;
  image: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  isNew: boolean;
  tags: string[];
  totalTime: string;
  progress?: any;
}
