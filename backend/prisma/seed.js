import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SUBJECTS = [
  'Mathematics', 'Algebra', 'Geometry', 'Calculus', 'Statistics',
  'Physics', 'Chemistry', 'Biology', 'Science', 'Environmental Science',
  'English', 'English Literature', 'Writing', 'Reading', 'Grammar', 'Creative Writing',
  'Spanish', 'French', 'German', 'Hindi',
  'History', 'Geography', 'Civics', 'Social Studies', 'Political Science', 'Economics',
  'Art', 'Music', 'Drama', 'Theater', 'Philosophy', 'Religion',
  'Computer Science', 'Programming', 'Web Development', 'Data Science', 'Information Technology',
  'Business Studies', 'Accounting', 'Finance', 'Marketing', 'Management',
  'Physical Education', 'Health', 'Sports',
  'SAT Preparation', 'ACT Preparation', 'GRE Preparation', 'GMAT Preparation',
  'IELTS Preparation', 'TOEFL Preparation',
];

async function main() {
  const result = await prisma.subject.createMany({
    data: DEFAULT_SUBJECTS.map((name) => ({ name })),
    skipDuplicates: true,
  });
  console.log(`Seeded ${result.count} subjects`);
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
