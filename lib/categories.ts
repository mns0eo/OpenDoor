import type { CategoryId } from "./types";

export interface Category {
  id: CategoryId;
  label: string;
  short: string;
  description: string;
}

export const CATEGORIES: Category[] = [
  {
    id: "academics",
    label: "Academic Subjects",
    short: "Academics",
    description: "Study strategies, AP courses, and getting ahead in tough classes.",
  },
  {
    id: "sat-college",
    label: "SAT / College Prep",
    short: "SAT & College",
    description: "Test prep, essays, and navigating the admissions process.",
  },
  {
    id: "entrepreneurship",
    label: "Entrepreneurship",
    short: "Entrepreneurship",
    description: "Turning ideas into projects, pitching, and business competitions.",
  },
  {
    id: "leadership",
    label: "Leadership",
    short: "Leadership",
    description: "Student government, running clubs, and public speaking.",
  },
  {
    id: "sports",
    label: "Sports",
    short: "Sports",
    description: "Making varsity, training habits, and balancing athletics with school.",
  },
  {
    id: "music",
    label: "Music & Performing Arts",
    short: "Music",
    description: "Auditions, practice routines, ensembles, and performance nerves.",
  },
  {
    id: "competitions",
    label: "Competitions",
    short: "Competitions",
    description: "Olympiads, debate, DECA, robotics, and other contests.",
  },
  {
    id: "personal",
    label: "Personal Development",
    short: "Personal Growth",
    description: "Time management, wellbeing, confidence, and school life.",
  },
];

export const CATEGORY_MAP: Record<CategoryId, Category> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c]),
) as Record<CategoryId, Category>;

export const GRADES = ["9", "10", "11", "12"];
