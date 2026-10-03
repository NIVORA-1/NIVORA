/**
 * ============================================================================
 * [DEV-ONLY] NIVORA MOCK DATABASE SEED SCRIPT
 * ============================================================================
 * WARNING: This script generates fake development/demo data.
 * It must NEVER be run in production or automatically during application startup.
 * To run manually for local development only:
 *   npm run db:seed
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️  Database seeding blocked in production environment.');
    process.exit(0);
  }

  console.log('🌱 Starting NIVORA [DEV-ONLY] Database Seeding...');

  // Clean existing
  await prisma.notification.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.application.deleteMany();
  await prisma.careerDossier.deleteMany();
  await prisma.project.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.musicTrack.deleteMany();
  await prisma.rebootSession.deleteMany();
  await prisma.plannerTask.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.classSchedule.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.discussion.deleteMany();
  await prisma.studyGroup.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create Default User (Rishabh S.)
  const user = await prisma.user.create({
    data: {
      email: 'rishabh@nivora.edu',
      passwordHash,
      name: 'Rishabh S.',
      avatar: 'https://lh3.googleusercontent.com/aida/AEtjO1XQOggMtk-HZrdEK3-xJhgF3aIDtDxnMmk38RT437_RQI_8qM6-idBraQBFSmp3xgKeQBBJfi2Y9vxkFtuKDE-6x1DEPChMr9_cuxzEi-Lkwc45afVsNaP5NXkb7hYjcxu6vFVrMoGr2kjoGcVBRbOZxTODCHKZ8_sJeEpxbW6rxmeFld4POcq2jzxipW8RJyJq_IX0qtaTCOtFPCTVGbuzCZk8zc3Qlm7F30mFhMPBInzMKPwaeIDgHvPJ0rzaGLpUCbdSOHtu84o',
      profile: {
        create: {
          college: 'Indian Institute of Technology',
          degree: 'B.Tech',
          stream: 'Computer Science & Engineering',
          streamCode: 'CSE',
          specialization: 'Distributed Systems & Database Kernels',
          year: 3,
          semester: 5,
          cgpa: 9.42,
          streakDays: 14,
          modulesVerified: 38,
          totalModules: 56,
          hoursPacedWeek: 22.5,
          focusScore: 72,
          reelsToday: 47,
          reelThreshold: 30,
          doomscrollMins: 38,
          doomscrollCap: 30,
          careerGoal: 'Distributed Systems / Low-Latency Infrastructure Engineer',
          bio: 'Building resilient distributed consensus, kernel concurrency, and high-throughput query planners.'
        }
      }
    }
  });

  console.log(`Created user: ${user.name} (${user.email})`);

  // 2. Seed Subjects (CSE Core)
  const dbms = await prisma.subject.create({
    data: {
      code: 'CS-301',
      name: 'Database Management Systems',
      streamCode: 'CSE',
      credits: 4.0,
      semester: 5,
      instructor: 'Dr. K. Sharma',
      room: 'Academic Block C, Hall B-204',
      attendanceRate: 84.6,
      safeMissesLeft: 6,
      projectedGrade: 'Grade A (88%)',
      activeModules: 17,
      totalModules: 25,
      color: '#8fc5a7'
    }
  });

  const dsa = await prisma.subject.create({
    data: {
      code: 'CS-302',
      name: 'Data Structures & Algorithms',
      streamCode: 'CSE',
      credits: 4.0,
      semester: 5,
      instructor: 'Prof. A. Bannerjee',
      room: 'Turing Lecture Hall 1',
      attendanceRate: 89.2,
      safeMissesLeft: 8,
      projectedGrade: 'Grade A+ (94%)',
      activeModules: 22,
      totalModules: 30,
      color: '#aae1c2'
    }
  });

  const os = await prisma.subject.create({
    data: {
      code: 'CS-303',
      name: 'Operating Systems & Concurrency',
      streamCode: 'CSE',
      credits: 4.0,
      semester: 5,
      instructor: 'Dr. V. Raman',
      room: 'Systems Lab 3',
      attendanceRate: 82.0,
      safeMissesLeft: 4,
      projectedGrade: 'Grade A (86%)',
      activeModules: 14,
      totalModules: 24,
      color: '#efd28e'
    }
  });

  const networks = await prisma.subject.create({
    data: {
      code: 'CS-304',
      name: 'Computer Networks & Protocols',
      streamCode: 'CSE',
      credits: 3.5,
      semester: 5,
      instructor: 'Prof. S. Sengupta',
      room: 'Hall B-102',
      attendanceRate: 91.5,
      safeMissesLeft: 9,
      projectedGrade: 'Grade A+ (92%)',
      activeModules: 10,
      totalModules: 20,
      color: '#a5d0b7'
    }
  });

  // Also seed BBA Subject for stream switching demo
  await prisma.subject.create({
    data: {
      code: 'BBA-301',
      name: 'Strategic Marketing & Brand Equity',
      streamCode: 'BBA',
      credits: 4.0,
      semester: 5,
      instructor: 'Prof. R. Mehta',
      room: 'Management Wing Hall 4',
      attendanceRate: 88.0,
      safeMissesLeft: 5,
      projectedGrade: 'Grade A',
      activeModules: 12,
      totalModules: 18,
      color: '#efd28e'
    }
  });

  // Also seed Mechanical Subject
  await prisma.subject.create({
    data: {
      code: 'ME-301',
      name: 'Applied Thermodynamics & Heat Transfer',
      streamCode: 'MECH',
      credits: 4.0,
      semester: 5,
      instructor: 'Dr. P. Nair',
      room: 'Fluid Dynamics Lab B',
      attendanceRate: 85.5,
      safeMissesLeft: 6,
      projectedGrade: 'Grade A',
      activeModules: 15,
      totalModules: 22,
      color: '#aae1c2'
    }
  });

  // 3. Topics for DBMS
  await prisma.topic.createMany({
    data: [
      { subjectId: dbms.id, unitNumber: 1, unitName: 'Relational Model & Relational Algebra', title: 'Tuple Calculus & Integrity Constraints', masteryPercent: 100, status: 'completed', isWeak: false },
      { subjectId: dbms.id, unitNumber: 2, unitName: 'SQL Engine & Query Execution', title: 'Complex Joins, Correlated Subqueries & Window Functions', masteryPercent: 94, status: 'completed', isWeak: false },
      { subjectId: dbms.id, unitNumber: 3, unitName: 'Normalization & Functional Dependencies', title: 'Bernstein 3NF Synthesis & BCNF Lossless Decomposition', masteryPercent: 68, status: 'in_progress', isWeak: true },
      { subjectId: dbms.id, unitNumber: 4, unitName: 'Transaction & Concurrency Control', title: 'Two-Phase Locking (2PL), MVCC & Serializability', masteryPercent: 30, status: 'in_progress', isWeak: false },
      { subjectId: dbms.id, unitNumber: 5, unitName: 'Storage & Indexing Engines', title: 'B+ Tree Page Splitting, LSM Trees & Write-Ahead Logs (WAL)', masteryPercent: 15, status: 'pending', isWeak: false },
    ]
  });

  // Topics for DSA
  await prisma.topic.createMany({
    data: [
      { subjectId: dsa.id, unitNumber: 1, unitName: 'Graph Algorithms', title: 'Dijkstra, A* Search & Minimum Spanning Trees', masteryPercent: 95, status: 'completed', isWeak: false },
      { subjectId: dsa.id, unitNumber: 2, unitName: 'Balanced Search Trees', title: 'AVL Tree Rotations & Red-Black Tree Balancing', masteryPercent: 52, status: 'in_progress', isWeak: true },
      { subjectId: dsa.id, unitNumber: 3, unitName: 'Dynamic Programming', title: 'Multi-dimensional DP, Bitmask DP & Knapsack Variants', masteryPercent: 60, status: 'in_progress', isWeak: true },
    ]
  });

  // 4. Assignments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 0, 0);

  await prisma.assignment.create({
    data: {
      subjectId: dbms.id,
      title: 'CS-301: DBMS Assignment 03 — Normalization & B+ Tree Indexing',
      code: 'DBMS-HW-03',
      description: 'Formal decomposition of relations into 3NF and BCNF with dependency preservation check. Implementation of leaf node splitting in B+ Tree storage engine.',
      deadline: tomorrow,
      estimatedMins: 35,
      weightage: 15.0,
      status: 'pending',
      totalTestCases: 10,
      testCasesPassed: 0
    }
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 5);

  await prisma.assignment.create({
    data: {
      subjectId: dsa.id,
      title: 'CS-302: Balanced Tree Rotations & Treap Implementation',
      code: 'DSA-PS-05',
      description: 'Implement left and right AVL rotations with height balance verification. Handle dual rotation scenarios and rebalancing invariants.',
      deadline: nextWeek,
      estimatedMins: 45,
      weightage: 10.0,
      status: 'pending',
      totalTestCases: 12,
      testCasesPassed: 0
    }
  });

  // 5. Classes (Weekly timetable)
  await prisma.classSchedule.createMany({
    data: [
      { subjectId: dbms.id, dayOfWeek: 2, startTime: '10:00 AM', endTime: '11:30 AM', room: 'Hall B-204', instructor: 'Dr. K. Sharma', type: 'lecture', meetingUrl: 'https://meet.google.com/abc-defg-hij' },
      { subjectId: dsa.id, dayOfWeek: 2, startTime: '02:00 PM', endTime: '03:30 PM', room: 'Turing Hall 1', instructor: 'Prof. A. Bannerjee', type: 'lecture', meetingUrl: 'https://meet.google.com/xyz-uvw-rst' },
      { subjectId: os.id, dayOfWeek: 3, startTime: '09:00 AM', endTime: '11:00 AM', room: 'Systems Lab 3', instructor: 'Dr. V. Raman', type: 'lab', meetingUrl: 'https://zoom.us/j/123456789' },
      { subjectId: networks.id, dayOfWeek: 4, startTime: '11:30 AM', endTime: '01:00 PM', room: 'Hall B-102', instructor: 'Prof. S. Sengupta', type: 'lecture', meetingUrl: 'https://meet.google.com/net-work-lab' },
    ]
  });

  // 6. Exams (No seeded exams - students add real exams via upload or manual entry)


  // 7. Planner Tasks
  const todayStr = new Date().toISOString().split('T')[0];

  await prisma.plannerTask.createMany({
    data: [
      {
        userId: user.id,
        title: 'DBMS Assignment: Normalization & Indexing Decompositions',
        description: 'Unit 3 3NF candidate key synthesis and minimal cover calculation.',
        category: 'assignments',
        date: todayStr,
        startTime: '11:00 AM',
        endTime: '11:45 AM',
        isCompleted: false,
        priority: 'high',
        relatedSubjectCode: 'CS-301'
      },
      {
        userId: user.id,
        title: 'DSA Revision: Trees & Dynamic Programming',
        description: 'Weakest topic in recent quiz · Recommended: 45 min focus on AVL rotations.',
        category: 'deepwork',
        date: todayStr,
        startTime: '02:30 PM',
        endTime: '03:15 PM',
        isCompleted: false,
        priority: 'high',
        relatedSubjectCode: 'CS-302'
      },
      {
        userId: user.id,
        title: 'Distributed Systems Project Sync',
        description: 'Peer coordination on Raft partition heal & leader election verification.',
        category: 'classes',
        date: todayStr,
        startTime: '04:30 PM',
        endTime: '05:15 PM',
        isCompleted: false,
        priority: 'medium',
        meetingUrl: 'https://zoom.us/j/9876543210'
      },
      {
        userId: user.id,
        title: '08:30 AM Operating Systems Lecture',
        description: 'Virtual Memory & Page Replacement algorithms.',
        category: 'classes',
        date: todayStr,
        startTime: '08:30 AM',
        endTime: '10:00 AM',
        isCompleted: true,
        priority: 'medium',
        relatedSubjectCode: 'CS-303'
      },
      {
        userId: user.id,
        title: '11:00 AM Systems Lab',
        description: 'POSIX Threading & Semaphore sync benchmark.',
        category: 'classes',
        date: todayStr,
        startTime: '11:00 AM',
        endTime: '01:00 PM',
        isCompleted: true,
        priority: 'medium',
        relatedSubjectCode: 'CS-303'
      },
      {
        userId: user.id,
        title: '02:00 PM DSA Speed Quiz',
        description: 'Graph BFS/DFS & TopoSort timed assessment.',
        category: 'exams',
        date: todayStr,
        startTime: '02:00 PM',
        endTime: '02:30 PM',
        isCompleted: true,
        priority: 'high',
        relatedSubjectCode: 'CS-302'
      }
    ]
  });

  // 8. Resource Vault
  await prisma.resource.createMany({
    data: [
      { subjectId: dbms.id, title: "Prof. Sharma's DBMS Master Pack (Units 1–4)", description: 'Official handwritten notes, annotated query diagrams, and sample mid-term questions.', type: 'notes', fileSize: '18.4 MB', author: 'Dr. K. Sharma', downloads: 312, tags: 'Master Pack, Theory, Notes' },
      { subjectId: dbms.id, title: 'Relational Normalization & Decomposition Decision Matrix', description: 'One-page cheat sheet for distinguishing 2NF, 3NF, BCNF, and 4NF violations.', type: 'cheatsheet', fileSize: '2.1 MB', author: 'NIVORA Peer Curators', downloads: 540, tags: 'Cheatsheet, Normalization, Quick' },
      { subjectId: dbms.id, title: 'DBMS 2020–2024 Mid-Term Papers with Marking Scheme', description: '5 years of solved university examination problem sets with step-by-step solutions.', type: 'pyq', fileSize: '8.7 MB', author: 'Academic Senate', downloads: 820, tags: 'PYQ, Exam, Solutions' },
      { subjectId: dsa.id, title: 'AVL Rotations & Balanced Trees Reference Blueprint', description: 'Pseudocode and formal invariants for self-balancing search trees.', type: 'slides', fileSize: '4.5 MB', author: 'Prof. A. Bannerjee', downloads: 270, tags: 'Trees, Algorithms, Slides' }
    ]
  });

  // 9. Music Tracks (External HTTPS Streams)
  await prisma.musicTrack.createMany({
    data: [
      {
        title: 'Redwood Trail Focus',
        subtitle: 'Acoustic Guitar • Algorithmic Velocity',
        artist: 'Jason Shaw (Audionautix)',
        category: 'focus',
        duration: '01:58',
        durationSec: 118,
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1e/Audionautix-com-ccby-redwoodtrail.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Chill Wave Study',
        subtitle: 'Lo-Fi Chillhop • Analog Tape Saturation',
        artist: 'Kevin MacLeod',
        category: 'lofi',
        duration: '04:00',
        durationSec: 240,
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Chill_Wave_%28ISRC_USUAN1600048%29.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Ossuary 3 - Words',
        subtitle: 'Ambient Space • Deep Academic Flow',
        artist: 'Kevin MacLeod',
        category: 'ambient',
        duration: '05:00',
        durationSec: 300,
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/63/Ossuary_3_-_Words_%28ISRC_USUAN1500045%29.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&auto=format&fit=crop&q=80',
      },
      {
        title: 'Bourne Woods Birdsong',
        subtitle: 'Nature Acoustics • Spring Rain & Forest',
        artist: 'Public Domain Soundscape',
        category: 'nature',
        duration: '04:05',
        durationSec: 245,
        audioUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/80/Bourne_Woods_2020-04-26_0815a.mp3',
        artworkUrl: 'https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?w=600&auto=format&fit=crop&q=80',
      },
    ],
  });

  // 10. Skills
  await prisma.skill.createMany({
    data: [
      { userId: user.id, name: 'Distributed Systems & Raft Consensus', category: 'Technical', level: 'Advanced', progress: 92, evidenceCount: 4, verified: true },
      { userId: user.id, name: 'Database Kernels & B+ Tree Indexing', category: 'Technical', level: 'Advanced', progress: 88, evidenceCount: 3, verified: true },
      { userId: user.id, name: 'Concurrent Programming (Go & Rust)', category: 'Technical', level: 'Master', progress: 95, evidenceCount: 6, verified: true },
      { userId: user.id, name: 'System Concurrency & Jepsen Chaos Testing', category: 'Technical', level: 'Advanced', progress: 85, evidenceCount: 2, verified: true },
      { userId: user.id, name: 'Technical Architectural Writing', category: 'Professional', level: 'Advanced', progress: 82, evidenceCount: 3, verified: true },
      { userId: user.id, name: 'Engineering Leadership & Code Review', category: 'Leadership', level: 'Intermediate', progress: 78, evidenceCount: 2, verified: true }
    ]
  });

  // 11. Projects
  await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Raft Consensus Protocol & Distributed KV Store',
      description: 'Production-grade Raft consensus implementation in Go featuring leader election, log replication, dynamic cluster reconfiguration, and linearizable key-value store validated under asymmetric network partitions with Jepsen.',
      repoUrl: 'github.com/rishabh-s/raft-distributed-kv',
      techStack: 'Go, Raft Protocol, gRPC, Jepsen, Docker',
      role: 'Lead Systems Architect',
      progress: 96,
      commitsCount: 342,
      verifiedAudit: true,
      jepsenPassed: true
    }
  });

  // 12. Career Dossier & Applications
  const dossier = await prisma.careerDossier.create({
    data: {
      userId: user.id,
      targetRole: 'Low-Latency Infrastructure / Core Systems Engineer',
      atsScore: 96,
      dossierNumber: '#NV-8492',
      targetPercentile: 'Top 3%',
      applications: {
        create: [
          { companyName: 'Jane Street Capital', role: 'Systems Software Engineer (Core)', status: 'oa', nextEvent: 'Online Assessment in 21h 40m', timingNotice: 'Urgent', compensation: '$220k - $250k Base', location: 'London / Hybrid' },
          { companyName: 'Google Infrastructure', role: 'Software Engineer - Distributed Storage', status: 'interview', nextEvent: 'Technical Round 2 on Thursday', timingNotice: 'Scheduled', compensation: '$180k - $210k', location: 'Zurich / Mountain View' },
          { companyName: 'Goldman Sachs', role: 'Quantitative Infrastructure Associate', status: 'applied', nextEvent: 'Resume screening cleared (ATS 96%)', timingNotice: 'Active', compensation: '$160k - $190k', location: 'New York / Bengaluru' }
        ]
      }
    }
  });

  // 13. Study Groups
  const group = await prisma.studyGroup.create({
    data: {
      name: 'Distributed Systems & Concurrency Club',
      subjectCode: 'CS-301 / CS-303',
      membersCount: 128,
      lastActive: '5m ago',
      description: 'Deep technical discussions on consensus invariants, formal TLA+ proofs, and memory barriers.'
    }
  });

  await prisma.discussion.create({
    data: {
      groupId: group.id,
      authorName: 'Aditya P.',
      title: 'How does Raft handle split-brain if election term overflows?',
      content: 'In term advancement under asymmetric network partition, if 2 nodes cannot communicate with the majority quorum, what ensures stale writes are rejected?',
      repliesCount: 7
    }
  });

  // 14. Notifications
  await prisma.notification.createMany({
    data: [
      { userId: user.id, title: 'DSA Topic Deficit Identified', description: 'Trees & AVL Rotations marked as weak in your recent speed quiz. Revision scheduled.', type: 'academic', isRead: false },
      { userId: user.id, title: 'Digital Habit Threshold Exceeded', description: 'You are 12 minutes above your daily reel limit. Take a 25m reset session.', type: 'reboot', isRead: false },
      { userId: user.id, title: 'Jane Street OA Scheduled', description: 'Assessment link received. Prepare via NIVORA AI Interview Simulator.', type: 'career', isRead: false },
      { userId: user.id, title: 'DBMS Assignment 03 Due Tomorrow', description: 'CS-301 B+ Tree indexing problem set due at 11:59 PM.', type: 'academic', isRead: true }
    ]
  });

  // 15. Achievements
  await prisma.achievement.createMany({
    data: [
      { userId: user.id, title: '14-Day Academic Streak', description: 'Consistent focused study logged every day for 2 straight weeks.', icon: 'local_fire_department' },
      { userId: user.id, title: 'Formal Verification Passed', description: 'Raft distributed protocol validated with zero linearizability violations under Jepsen chaos.', icon: 'verified_user' },
      { userId: user.id, title: 'Top 5% Cognitive Index', description: 'Maintained optimal 75+ focus score during mid-term preparation cycle.', icon: 'psychology' }
    ]
  });

  console.log('✅ Database Seeding Completed Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
