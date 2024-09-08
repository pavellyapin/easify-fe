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
    question: 'Where do you live?',
    options: ['Newmarket, Ontario , Canada', 'Toronto, Ontario , Canada'],
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
    question: 'Do you work on the weekend?',
    options: ['No', 'Saturdays', 'Only Sundays'],
    type: 'multiple',
  },
  {
    id: 4,
    question: 'How many hours a day do you work on average?',
    options: ['Less then 8', '8 hours', 'More then 8'],
    type: 'multiple',
  },
  {
    id: 5,
    question: 'What kind of food do you like?',
    options: [
      'Meat',
      'Soup',
      'Eggs',
      'Fish',
      'Cheese',
      'Fruit',
      'Baked',
      'Chocolate',
      'Rice',
      'Pasta',
    ],
    type: 'multiple',
  },
  {
    id: 6,
    question: 'Do often do you drive?',
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
  {
    id: 11,
    question: 'What is the field of your work?',
    options: ['Accounting', 'Finance', 'Information Technology', 'Programming'],
    type: 'multiple',
  },
  {
    id: 12,
    question: 'Please expand more about what you do at work',
    type: 'open',
  },
  {
    id: 13,
    question: 'Are you responsible for any kids or pets?',
    type: 'open',
  },
  {
    id: 14,
    question: 'What time do you usually get up in the morning?',
    type: 'open',
  },
  {
    id: 15,
    question: 'What time do you usually go to sleep?',
    type: 'open',
  },
];
