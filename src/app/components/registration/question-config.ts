export interface QuestionConfig {
  id: number;
  question: string;
  options?: string[]; // Optional, only for multiple choice questions
  type: 'single' | 'multiple' | 'open'; // Define question types
}

export const QUESTIONS: QuestionConfig[] = [
  // Personal Information and Lifestyle
  {
    id: 1,
    question: 'What time do you usually wake up on weekdays?',
    options: ['Before 7am', '7am-830am', 'After 9am'],
    type: 'single',
  },
  {
    id: 2,
    question: 'Do you commute or work remotely?',
    options: [
      'Long commute',
      'Short commute',
      'Hybrid',
      'Fully remote',
      'Not working',
    ],
    type: 'single',
  },
  {
    id: 3,
    question: 'Do you commute or work remotely?',
    options: [
      'Long commute',
      'Short commute',
      'Hybrid',
      'Fully remote',
      'Not working',
    ],
    type: 'single',
  },
  {
    id: 4,
    question: 'How do you usually spend your weekends?',
    options: [
      'Relaxing at home',
      'Outdoor activities',
      'Socializing with friends',
      'Traveling',
      'Chores',
      'Learning',
      'Partying',
    ],
    type: 'multiple',
  },
  {
    id: 5,
    question: 'How do you feel about your work-life balance?',
    options: ['Satisfied', 'Could be better', 'Struggling'],
    type: 'single',
  },
  {
    id: 6,
    question: 'How often do you exercise?',
    options: ['Daily', 'A few times a week', 'Occasionally', 'Rarely'],
    type: 'single',
  },
  {
    id: 7,
    question: 'What types of physical activities do you enjoy?',
    options: [
      'Running',
      'Yoga',
      'Gym workouts',
      'Team sports',
      'Swimming',
      'Cycling',
      'Hiking',
      'Pilates',
      'Dancing',
      'Martial Arts',
      'Tennis',
      'Rock Climbing',
      'Rowing',
      'CrossFit',
      'Walking',
    ],
    type: 'multiple',
  },
  {
    id: 8,
    question: 'How often do you socialize with friends?',
    options: ['Very often', 'Sometimes', 'Rarely', 'Never'],
    type: 'single',
  },
  {
    id: 9,
    question: 'How do you prefer to manage your finances?',
    options: ['Budgeting', 'Investing', 'Saving', 'Spending'],
    type: 'multiple',
  },
  {
    id: 10,
    question: 'How do you prefer to learn new things?',
    options: [
      'Reading',
      'Online courses',
      'Workshops',
      'Hands-on experience',
      'Podcasts',
      'Videos',
      'Mentoring',
      'Group discussions',
      'Webinars',
      'Interactive apps',
      'Attending lectures',
    ],
    type: 'multiple',
  },
];
