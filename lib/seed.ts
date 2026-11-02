// FICTIONAL DEMO DATA. Every person below is invented for demonstration purposes.
// No real student information is used. All records are flagged `isDemo: true`
// and labeled "Demo profile" in the UI.

import type {
  CategoryId,
  Database,
  Feedback,
  MentorApplication,
  MentorProfile,
  MentoringRequest,
  User,
} from "./types";
import { demoHash } from "./utils";

export const DB_VERSION = 1;
export const DEMO_PASSWORD = "demo1234";

/** The three accounts advertised for live demos (see README + Switch demo user button). */
export const DEMO_ACCOUNTS = [
  { userId: "u_riley", label: "Mentee", email: "riley@demo.opendoor", description: "Riley Morgan · Grade 9 student" },
  { userId: "u_alex", label: "Mentor", email: "alex@demo.opendoor", description: "Alex Kim · Approved mentor (SAT)" },
  { userId: "u_admin", label: "Admin", email: "admin@demo.opendoor", description: "Taylor Brooks · Program admin" },
] as const;

type MentorSeed = Omit<MentorProfile, "id" | "userId" | "listed" | "isDemo" | "createdAt"> & { key: string; email: string };

const MENTOR_SEEDS: MentorSeed[] = [
  {
    key: "alex",
    email: "alex@demo.opendoor",
    name: "Alex Kim",
    grade: "12",
    headline: "SAT Preparation",
    categories: ["sat-college", "academics"],
    achievements: ["SAT 1570 (800 Math)", "National Merit Semifinalist", "AP Scholar with Distinction"],
    intro: "I went from a 1380 to a 1570 in five months. I'll help you build a study plan that actually sticks.",
    bio: "I'm a senior who spent most of junior year figuring out how to study for the SAT efficiently. What worked for me wasn't more hours — it was smarter review and timed practice. I love helping underclassmen skip the trial-and-error phase.",
    experience: ["Peer tutor, TVS Math Lab (2 years)", "Led a 6-week SAT study group for juniors"],
    skills: ["Test strategy", "Study planning", "Algebra & data analysis", "Reading comprehension"],
    topics: ["SAT strategies", "Study planning", "Test-day preparation", "Choosing between SAT and ACT"],
    formats: ["online", "in-person"],
    availability: "available",
    availabilityNote: "Weekday afternoons after 3:30 PM",
  },
  {
    key: "sophia",
    email: "sophia@demo.opendoor",
    name: "Sophia Lee",
    grade: "11",
    headline: "Entrepreneurship",
    categories: ["entrepreneurship", "competitions"],
    achievements: ["Founded a student-led sustainable stationery project", "DECA State finalist", "Raised $2,400 for a school charity drive"],
    intro: "I started a small business in 10th grade. I can help you go from idea to first customer.",
    bio: "I started a small eco-friendly stationery project with two friends and learned (mostly the hard way) how to price, pitch, and keep a team motivated. I'm happy to brainstorm ideas or prep you for business competitions.",
    experience: ["Co-founder, student stationery project", "DECA chapter VP of Marketing"],
    skills: ["Pitching", "Customer interviews", "Basic financial planning", "Canva & social media"],
    topics: ["Business ideas", "Pitching", "Entrepreneurship competitions", "Starting a school club"],
    formats: ["online", "in-person"],
    availability: "available",
    availabilityNote: "Tuesdays & Thursdays, lunch or after school",
  },
  {
    key: "daniel",
    email: "daniel@demo.opendoor",
    name: "Daniel Park",
    grade: "12",
    headline: "Leadership & Public Speaking",
    categories: ["leadership", "personal"],
    achievements: ["Student Government President", "Model UN Best Delegate (x2)", "Organized the first all-school service day"],
    intro: "Leading is mostly listening. I'll help you run for office, lead a club, or speak with confidence.",
    bio: "I've been in student government since 9th grade and now serve as president. I've made plenty of mistakes running meetings and campaigns, and I like helping others build confidence faster than I did.",
    experience: ["Student Government (4 years)", "Model UN Secretary-General"],
    skills: ["Public speaking", "Campaign planning", "Running effective meetings", "Conflict resolution"],
    topics: ["Leadership development", "Student organizations", "Public speaking", "Running for office"],
    formats: ["in-person", "online"],
    availability: "limited",
    availabilityNote: "Fridays only — busy campaign season",
  },
  {
    key: "emma",
    email: "emma@demo.opendoor",
    name: "Emma Chen",
    grade: "11",
    headline: "Music & Auditions",
    categories: ["music", "competitions"],
    achievements: ["All-State Orchestra (Violin)", "Concertmaster, TVS Chamber Orchestra", "Regional solo competition — 1st place"],
    intro: "Auditions are a skill you can practice. I'll share the routine that got me into All-State.",
    bio: "I've played violin for ten years. The biggest jump in my playing came from changing how I practiced, not how long. I can help with audition prep, practice structure, and managing performance nerves.",
    experience: ["Concertmaster (2 years)", "Volunteer music teacher at a community center"],
    skills: ["Audition preparation", "Deliberate practice", "Sight-reading", "Performance anxiety"],
    topics: ["Auditions", "Practice strategies", "Music competitions", "Balancing music with academics"],
    formats: ["in-person", "online"],
    availability: "available",
    availabilityNote: "Weekends and Wednesday evenings",
  },
  {
    key: "marcus",
    email: "marcus@demo.opendoor",
    name: "Marcus Johnson",
    grade: "12",
    headline: "Varsity Athletics",
    categories: ["sports", "personal"],
    achievements: ["Varsity Basketball Captain", "All-District First Team", "Scholar-Athlete Award"],
    intro: "Making varsity takes more than talent. I'll help you train smart and keep your grades up in season.",
    bio: "I've played varsity basketball for three years and captain the team this season. Balancing practice, games, and AP classes forced me to get serious about time management — happy to share what works.",
    experience: ["Varsity basketball (3 years)", "Summer youth basketball camp coach"],
    skills: ["Training plans", "Tryout preparation", "Time management", "Team leadership"],
    topics: ["Making varsity", "Off-season training", "Balancing sports and school", "Being a team captain"],
    formats: ["in-person"],
    availability: "available",
    availabilityNote: "Mornings before school, Mon–Thu",
  },
  {
    key: "priya",
    email: "priya@demo.opendoor",
    name: "Priya Shah",
    grade: "12",
    headline: "STEM Academics",
    categories: ["academics", "competitions"],
    achievements: ["Top 5% of class", "AP Calculus BC & AP Biology — score 5", "USABO Semifinalist"],
    intro: "Hard classes get easier with the right system. Let's make AP Bio and Calc feel manageable.",
    bio: "I love biology and math, and I've taken most of the AP science sequence. My notes system and spaced-repetition routine helped me stay ahead — I'll show you how to build your own.",
    experience: ["Science Olympiad captain", "Peer tutor for AP Biology"],
    skills: ["Note-taking systems", "Spaced repetition", "Biology", "Calculus"],
    topics: ["AP course selection", "Study strategies", "Science Olympiad", "Exam preparation"],
    formats: ["online"],
    availability: "available",
    availabilityNote: "Sunday afternoons, online",
  },
  {
    key: "hannah",
    email: "hannah@demo.opendoor",
    name: "Hannah Okafor",
    grade: "12",
    headline: "College Admissions",
    categories: ["sat-college", "personal"],
    achievements: ["Admitted Early Decision to an Ivy League university", "Published student essay in a regional anthology", "QuestBridge Finalist"],
    intro: "Your story matters more than your stats. I'll help you find it and tell it well.",
    bio: "I just finished the college application process and remember how overwhelming it was. I focus on essays, building a balanced college list, and making a realistic timeline.",
    experience: ["Writing Center peer reader", "Editor, school literary magazine"],
    skills: ["Personal statements", "Supplemental essays", "College list building", "Interview prep"],
    topics: ["College essays", "Building a college list", "Application timelines", "Early Decision vs. Regular"],
    formats: ["online", "in-person"],
    availability: "limited",
    availabilityNote: "Two sessions per week",
  },
  {
    key: "ethan",
    email: "ethan@demo.opendoor",
    name: "Ethan Nguyen",
    grade: "11",
    headline: "Robotics & Math Competitions",
    categories: ["competitions", "academics"],
    achievements: ["FIRST Robotics — State Qualifier (Lead Programmer)", "AIME Qualifier", "Hackathon winner, Houston Youth Hack"],
    intro: "From AMC to robotics, I'll help you prep for competitions and learn to love hard problems.",
    bio: "I program for our robotics team and compete in math contests. I enjoy breaking down tough problems and showing people that competitions are about curiosity, not just talent.",
    experience: ["Lead programmer, robotics team", "Math club problem-set writer"],
    skills: ["Python & Java", "Competition math", "Problem solving", "Team projects"],
    topics: ["AMC / AIME prep", "Joining robotics", "Hackathons", "Learning to code"],
    formats: ["online", "in-person"],
    availability: "available",
    availabilityNote: "Weekday evenings, online",
  },
  {
    key: "olivia",
    email: "olivia@demo.opendoor",
    name: "Olivia Rossi",
    grade: "11",
    headline: "Wellbeing & Time Management",
    categories: ["personal", "leadership"],
    achievements: ["Peer Support Leader", "Founded the TVS Mindful Mondays club", "Student Ambassador for new families"],
    intro: "Transitioning to a new school or a heavy schedule? I'll help you find balance without burning out.",
    bio: "I moved to TVS in 9th grade and know how tough the adjustment can be. As a peer support leader, I help students build routines, manage stress, and find their people.",
    experience: ["Peer Support Leader (2 years)", "New-student ambassador"],
    skills: ["Time management", "Habit building", "Stress management", "Onboarding new students"],
    topics: ["Adjusting to a new school", "Planning your week", "Managing stress", "Finding extracurriculars"],
    formats: ["in-person", "online"],
    availability: "available",
    availabilityNote: "Mondays & Wednesdays after school",
  },
  {
    key: "noah",
    email: "noah@demo.opendoor",
    name: "Noah Williams",
    grade: "11",
    headline: "Soccer & Track",
    categories: ["sports"],
    achievements: ["Varsity Soccer starter (since 9th grade)", "Regional qualifier, 800m", "Team MVP 2025"],
    intro: "Speed and stamina are trainable. I'll help you plan your season and avoid common injuries.",
    bio: "I play varsity soccer in the fall and run track in the spring. I've learned a lot about recovery, conditioning, and keeping motivation through a long season.",
    experience: ["Varsity soccer (3 seasons)", "Track & field (2 seasons)"],
    skills: ["Conditioning", "Recovery routines", "Tryout prep", "Goal setting"],
    topics: ["Soccer tryouts", "Running and conditioning", "Injury prevention basics", "Multi-sport athletes"],
    formats: ["in-person"],
    availability: "unavailable",
    availabilityNote: "In season — back in December",
  },
  {
    key: "isabella",
    email: "isabella@demo.opendoor",
    name: "Isabella Garcia",
    grade: "12",
    headline: "Debate & Writing",
    categories: ["competitions", "leadership", "academics"],
    achievements: ["State Debate Semifinalist (Lincoln-Douglas)", "Debate Team Captain", "Scholastic Writing Award — Gold Key"],
    intro: "Debate taught me how to think on my feet. I'll help you argue clearly — in rounds and on paper.",
    bio: "I've competed in Lincoln-Douglas debate for four years and captain the team. I can help you with case writing, research, cross-examination, and persuasive essays for English class.",
    experience: ["Debate captain", "Middle school debate camp instructor"],
    skills: ["Argumentation", "Research", "Persuasive writing", "Speaking under pressure"],
    topics: ["Starting debate", "Case writing", "Essay structure", "Speaking with confidence"],
    formats: ["online", "in-person"],
    availability: "available",
    availabilityNote: "Thursdays and weekend mornings",
  },
];

export function buildSeed(now = new Date()): Database {
  const iso = (d: Date) => d.toISOString();
  const days = (n: number, hour = 16, minute = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() + n);
    d.setHours(hour, minute, 0, 0);
    return iso(d);
  };
  const created = days(-60, 9);
  const pw = demoHash(DEMO_PASSWORD);

  const baseUser = (u: Partial<User> & Pick<User, "id" | "name" | "email" | "grade">): User => ({
    passwordHash: pw,
    bio: "",
    interests: "",
    isAdmin: false,
    mentorStatus: "none",
    activeRole: "mentee",
    isDemo: true,
    createdAt: created,
    ...u,
  });

  const users: User[] = [
    baseUser({
      id: "u_riley",
      name: "Riley Morgan",
      email: "riley@demo.opendoor",
      grade: "9",
      bio: "New to TVS this year. Interested in SAT prep, starting a club, and making the soccer team.",
      interests: "SAT prep, entrepreneurship, soccer",
    }),
    baseUser({ id: "u_sam", name: "Sam Patel", email: "sam@demo.opendoor", grade: "10", interests: "Leadership, SAT" }),
    baseUser({ id: "u_ava", name: "Ava Wright", email: "ava@demo.opendoor", grade: "10", interests: "Music, SAT" }),
    baseUser({
      id: "u_jordan",
      name: "Jordan Rivera",
      email: "jordan@demo.opendoor",
      grade: "11",
      mentorStatus: "pending",
      interests: "Chemistry, Science Olympiad",
    }),
    baseUser({
      id: "u_mia",
      name: "Mia Thompson",
      email: "mia@demo.opendoor",
      grade: "10",
      mentorStatus: "pending",
      interests: "Art, design",
    }),
    baseUser({
      id: "u_admin",
      name: "Taylor Brooks",
      email: "admin@demo.opendoor",
      grade: "Staff",
      isAdmin: true,
      bio: "OpenDoor program coordinator (fictional demo admin).",
    }),
  ];

  const mentors: MentorProfile[] = MENTOR_SEEDS.map(({ key, email, ...m }) => {
    users.push(
      baseUser({
        id: `u_${key}`,
        name: m.name,
        email,
        grade: m.grade,
        mentorStatus: "approved",
        activeRole: key === "alex" ? "mentor" : "mentee",
        bio: m.bio,
      }),
    );
    return { ...m, id: `m_${key}`, userId: `u_${key}`, listed: true, isDemo: true, createdAt: created };
  });

  const req = (
    id: string,
    menteeId: string,
    mentorKey: string,
    category: CategoryId,
    preferredAt: string,
    status: MentoringRequest["status"],
    helpWith: string,
    extra: Partial<MentoringRequest> = {},
  ): MentoringRequest => {
    const mentee = users.find((u) => u.id === menteeId)!;
    return {
      id,
      mentorId: `m_${mentorKey}`,
      mentorUserId: `u_${mentorKey}`,
      menteeId,
      menteeName: mentee.name,
      category,
      helpWith,
      format: "online",
      preferredAt,
      notes: "",
      status,
      mentorNote: "",
      durationMinutes: null,
      completedAt: null,
      createdAt: days(-20, 10),
      updatedAt: days(-18, 10),
      ...extra,
    };
  };

  const requests: MentoringRequest[] = [
    req("r_1", "u_riley", "alex", "sat-college", days(3, 16), "pending",
      "I'm taking my first practice SAT next month and don't know where to start. Could you help me build a study schedule?",
      { notes: "I'm free most days after 3:30.", createdAt: days(-1, 18) }),
    req("r_2", "u_riley", "sophia", "entrepreneurship", days(5, 12, 30), "accepted",
      "I have an idea for a used-textbook exchange at school and want feedback on whether it could work.",
      { format: "in-person", mentorNote: "Love this idea! Let's meet at the library.", createdAt: days(-3, 9) }),
    req("r_3", "u_riley", "alex", "sat-college", days(-7, 16), "completed",
      "How do I approach the reading section? I keep running out of time.",
      { durationMinutes: 45, completedAt: days(-7, 17), createdAt: days(-12, 9) }),
    req("r_4", "u_sam", "alex", "sat-college", days(2, 15, 30), "pending",
      "Should I take the SAT or the ACT? My practice scores are close.", { createdAt: days(-2, 20) }),
    req("r_5", "u_sam", "alex", "academics", days(6, 16), "accepted",
      "Need help reviewing Algebra II before the midterm.", { format: "in-person", createdAt: days(-4, 11) }),
    req("r_6", "u_ava", "alex", "sat-college", days(-14, 16), "completed",
      "Help me plan a 6-week SAT math review.", { durationMinutes: 60, completedAt: days(-14, 17) }),
    req("r_7", "u_ava", "emma", "music", days(-10, 17), "completed",
      "Preparing for region orchestra auditions — how should I structure my practice?",
      { format: "in-person", durationMinutes: 30, completedAt: days(-10, 17, 30) }),
    req("r_8", "u_sam", "daniel", "leadership", days(4, 12), "declined",
      "I want to run for class representative.", { mentorNote: "Fully booked this week — please try again next week!" }),
    req("r_9", "u_riley", "priya", "academics", days(8, 14), "canceled", "Choosing AP classes for next year."),
    req("r_10", "u_ava", "marcus", "sports", days(9, 7, 30), "pending", "How can I prepare for basketball tryouts?",
      { format: "in-person" }),
    req("r_11", "u_sam", "hannah", "sat-college", days(-5, 15), "completed",
      "Brainstorming topics for my personal statement.", { durationMinutes: 50, completedAt: days(-5, 16) }),
  ];

  const feedback: Feedback[] = [
    {
      id: "f_1", requestId: "r_6", mentorId: "m_alex", menteeId: "u_ava", rating: 5, helpful: "yes",
      learned: "How to use an error log to track the question types I miss.",
      improve: "Nothing — maybe share the practice resources ahead of time.",
      review: "Alex was super clear and encouraging. I left with a real plan.", consentToShare: true, createdAt: days(-13, 9),
    },
    {
      id: "f_2", requestId: "r_7", mentorId: "m_emma", menteeId: "u_ava", rating: 4, helpful: "yes",
      learned: "Slow practice with a metronome and recording myself.",
      improve: "Would have liked a bit more time on sight-reading.",
      review: "", consentToShare: false, createdAt: days(-9, 19),
    },
    {
      id: "f_3", requestId: "r_11", mentorId: "m_hannah", menteeId: "u_sam", rating: 5, helpful: "yes",
      learned: "My essay should show one specific moment, not my whole résumé.",
      improve: "", review: "Hannah gave honest, kind feedback.", consentToShare: false, createdAt: days(-4, 21),
    },
  ];

  const applications: MentorApplication[] = [
    {
      id: "a_1", userId: "u_jordan", name: "Jordan Rivera", grade: "11", categories: ["academics", "competitions"],
      expertise: "Chemistry & Science Olympiad",
      achievements: "Science Olympiad regional medalist (Chemistry Lab); AP Chemistry score 5; Chem Club co-president",
      experience: "Tutored three freshmen in Honors Chemistry last spring.",
      motivation: "Chemistry clicked for me late, and I want to help others reach that moment sooner.",
      topics: "Honors/AP Chemistry, Science Olympiad lab events, study habits",
      availability: "Tuesday and Thursday after school", formats: ["in-person", "online"],
      status: "pending", reviewNote: "", createdAt: days(-2, 14), reviewedAt: null,
    },
    {
      id: "a_2", userId: "u_mia", name: "Mia Thompson", grade: "10", categories: ["music", "personal"],
      expertise: "Visual Arts & Portfolio Building",
      achievements: "Scholastic Art Award — Silver Key; designed the 2025 school play poster",
      experience: "Volunteer art assistant at a summer camp.",
      motivation: "I want more students to feel confident sharing their creative work.",
      topics: "Starting an art portfolio, digital illustration basics, creative confidence",
      availability: "Weekend afternoons, online", formats: ["online"],
      status: "pending", reviewNote: "", createdAt: days(-1, 11), reviewedAt: null,
    },
  ];

  return { version: DB_VERSION, users, mentors, requests, feedback, applications, sessionUserId: null };
}
