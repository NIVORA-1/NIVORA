import prisma from '../src/lib/prisma';

async function main() {
  console.log('Seeding initial Clubs, Announcements, and Events...');

  // Find a leader user if available
  const rishabh = await prisma.user.findFirst({
    where: { email: { contains: 'rishabh' } },
  });
  const vinay = await prisma.user.findFirst({
    where: { email: { contains: 'vinay' } },
  });

  const leaderId = rishabh?.id || vinay?.id || undefined;

  // 1. Create Clubs
  const acmClub = await prisma.club.upsert({
    where: { slug: 'acm-student-chapter' },
    update: {},
    create: {
      name: 'ACM Student Chapter',
      slug: 'acm-student-chapter',
      description: 'Premier computing society dedicated to advancing computer science as a science and profession through algorithm sprints, hackathons, and systems reading groups.',
      category: 'Technical',
      logo: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=150&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&auto=format&fit=crop&q=80',
      leaderId,
    },
  });

  const roboticsClub = await prisma.club.upsert({
    where: { slug: 'hardware-robotics-society' },
    update: {},
    create: {
      name: 'Hardware & Robotics Society',
      slug: 'hardware-robotics-society',
      description: 'Hands-on engineering group focused on FPGA architecture, embedded RTOS, autonomous drones, and mechatronics.',
      category: 'Robotics & Hardware',
      logo: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=150&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1200&auto=format&fit=crop&q=80',
      leaderId: vinay?.id || leaderId,
    },
  });

  const designClub = await prisma.club.upsert({
    where: { slug: 'design-ui-guild' },
    update: {},
    create: {
      name: 'Design & UI Guild',
      slug: 'design-ui-guild',
      description: 'Designers, researchers, and creative coders exploring human-computer interaction, spatial interfaces, and design systems.',
      category: 'Design & UI',
      logo: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&auto=format&fit=crop&q=80',
      leaderId,
    },
  });

  const gdscClub = await prisma.club.upsert({
    where: { slug: 'google-developer-student-club' },
    update: {},
    create: {
      name: 'Google Developer Student Club',
      slug: 'google-developer-student-club',
      description: 'Community group for students interested in Google developer technologies, cloud architecture, and open source contributions.',
      category: 'Technical',
      logo: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=150&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=1200&auto=format&fit=crop&q=80',
      leaderId,
    },
  });

  const quantClub = await prisma.club.upsert({
    where: { slug: 'fintech-quant-society' },
    update: {},
    create: {
      name: 'FinTech & Quant Society',
      slug: 'fintech-quant-society',
      description: 'Algorithmic trading, quantitative research, decentralized finance protocols, and financial modeling.',
      category: 'Business',
      logo: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=150&auto=format&fit=crop&q=80',
      bannerImage: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop&q=80',
      leaderId,
    },
  });

  console.log('Clubs created.');

  // 2. Announcements
  if (leaderId) {
    const existingAnnouncements = await prisma.clubAnnouncement.count();
    if (existingAnnouncements === 0) {
      await prisma.clubAnnouncement.createMany({
        data: [
          {
            clubId: acmClub.id,
            authorId: leaderId,
            title: 'HackCampus \'25 Track Guidelines Released',
            content: 'The 36-hour distributed systems hackathon problem statements and hardware cluster SSH credentials are now published in the hackathon portal. Register before Oct 10!',
          },
          {
            clubId: acmClub.id,
            authorId: leaderId,
            title: 'Weekly Systems Paper Reading: Raft vs Multi-Paxos',
            content: 'Join us this Wednesday at 6 PM in Turing Hall for a line-by-line review of Ongaro and Ousterhout\'s consensus paper.',
          },
          {
            clubId: roboticsClub.id,
            authorId: leaderId,
            title: 'Lab Access for FPGA Bootcamp Participants',
            content: 'All registered participants have been granted RFID clearance to VLSI Design Studio B starting this Friday.',
          },
          {
            clubId: designClub.id,
            authorId: leaderId,
            title: 'Figma Community Design Challenge Winner Announced',
            content: 'Congratulations to the Nivora Dark Mode palette design team for winning the September Community Spotlight!',
          },
        ],
      });
      console.log('Announcements seeded.');
    }
  }

  // 3. Events
  const eventsData = [
    {
      title: 'HackCampus \'25: Systems & Distributed Infrastructure 36h Hackathon',
      description: 'Build high-throughput distributed protocols, consensus algorithms, or zero-knowledge proof verifiers. Hardware clusters and cloud credits provided.',
      category: 'Hackathon',
      date: 'Oct 12 - 14, 2026',
      eventDate: new Date('2026-10-12T09:00:00Z'),
      startTime: '09:00 AM',
      endTime: '09:00 PM',
      venue: 'Computing Centre East / Main Auditorium',
      organizerName: 'ACM Student Chapter & NIVORA Labs',
      clubId: acmClub.id,
      capacity: 150,
      registrationDeadline: new Date('2026-10-10T23:59:59Z'),
      prizePool: '₹2,50,000 + Jane Street / Google Fast-Track Interviews',
      createdById: leaderId,
    },
    {
      title: 'Modern High-Concurrency Storage Engines: From B+ Trees to LSM Trees',
      description: 'Distinguished lecture by Dr. S. Narayanan on production RocksDB optimizations, memory-mapped I/O, and io_uring kernels in multi-core systems.',
      category: 'Technical Keynote',
      date: 'Oct 05, 2026',
      eventDate: new Date('2026-10-05T16:30:00Z'),
      startTime: '04:30 PM',
      endTime: '06:30 PM',
      venue: 'Turing Auditorium Hall 1',
      organizerName: 'Google Cloud Systems Group',
      clubId: acmClub.id,
      capacity: 200,
      registrationDeadline: new Date('2026-10-04T18:00:00Z'),
      prizePool: undefined,
      createdById: leaderId,
    },
    {
      title: 'FPGA & RISC-V Pipeline Synthesis Bootcamp',
      description: 'Hands-on Verilog design of a 5-stage pipelined RISC-V core with hazard detection, branch prediction, and forwarding units.',
      category: 'Workshop',
      date: 'Oct 18, 2026',
      eventDate: new Date('2026-10-18T10:00:00Z'),
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      venue: 'VLSI Design Studio B',
      organizerName: 'Hardware & Robotics Society',
      clubId: roboticsClub.id,
      capacity: 40,
      registrationDeadline: new Date('2026-10-17T20:00:00Z'),
      prizePool: undefined,
      createdById: leaderId,
    },
    {
      title: 'Spatial UI & Micro-Interactions Design Sprint',
      description: 'Master component architecture, tactile micro-interactions, and design token pipelines for responsive modern web applications.',
      category: 'Workshop',
      date: 'Oct 24, 2026',
      eventDate: new Date('2026-10-24T14:00:00Z'),
      startTime: '02:00 PM',
      endTime: '07:00 PM',
      venue: 'Design Pavilion 3',
      organizerName: 'Design & UI Guild',
      clubId: designClub.id,
      capacity: 50,
      registrationDeadline: new Date('2026-10-23T23:59:00Z'),
      prizePool: '₹50,000 + Figma Pro Licenses',
      createdById: leaderId,
    },
    {
      title: 'Distributed Consensus & Fault-Tolerance Symposium',
      description: 'Retrospective seminar covering Paxos, Raft, Viewstamped Replication, and Byzantine fault tolerance across global clusters.',
      category: 'Technical Keynote',
      date: 'Aug 14, 2026',
      eventDate: new Date('2026-08-14T10:00:00Z'), // Past event
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      venue: 'Ramanujan Seminar Hall',
      organizerName: 'ACM Student Chapter',
      clubId: acmClub.id,
      capacity: 100,
      registrationDeadline: new Date('2026-08-13T18:00:00Z'),
      prizePool: undefined,
      createdById: leaderId,
    },
  ];

  for (const ev of eventsData) {
    const existing = await prisma.event.findFirst({
      where: { title: ev.title },
    });
    if (!existing) {
      await prisma.event.create({
        data: ev,
      });
    }
  }

  console.log('Events seeded successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding clubs and events:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
