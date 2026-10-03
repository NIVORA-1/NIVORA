import prisma from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

const SAMPLE_STUDENTS = [
  {
    email: 'arav.sharma@nivora.edu',
    name: 'Aarav Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face',
    profile: {
      college: 'Indian Institute of Technology',
      degree: 'B.Tech',
      stream: 'Computer Science & Engineering',
      streamCode: 'CSE',
      specialization: 'Distributed Systems & Cloud Kernels',
      semester: 5,
      year: 3,
      cgpa: 9.32,
      careerGoal: 'Distributed Systems Infrastructure Engineer',
      bio: 'Researching Byzantine consensus, Raft implementations, and Rust-based network kernels.',
      interests: ['Distributed Systems', 'Rust', 'Cloud Infrastructure', 'Open Source', 'Hackathons'],
    },
    skills: [
      { name: 'Rust', category: 'Technical', level: 'Advanced', progress: 90, verified: true },
      { name: 'Distributed Systems', category: 'Technical', level: 'Advanced', progress: 88, verified: true },
      { name: 'Go / gRPC', category: 'Technical', level: 'Intermediate', progress: 82, verified: true },
      { name: 'Kubernetes & Docker', category: 'Technical', level: 'Intermediate', progress: 78, verified: true },
      { name: 'Technical Leadership', category: 'Leadership', level: 'Intermediate', progress: 75, verified: false },
    ],
    projects: [
      {
        name: 'Raft-KV Engine',
        description: 'Linearizable, fault-tolerant key-value store using Raft consensus in Rust.',
        techStack: 'Rust, Tokio, Raft, gRPC',
        repoUrl: 'github.com/aarav/raft-kv',
        role: 'Systems Architect',
      },
      {
        name: 'Epoll Network Proxy',
        description: 'High-throughput async reverse proxy with zero-copy TCP socket splicing.',
        techStack: 'C++, Linux epoll, CMake',
        repoUrl: 'github.com/aarav/epoll-proxy',
        role: 'Core Developer',
      },
    ],
  },
  {
    email: 'ananya.iyer@nivora.edu',
    name: 'Ananya Iyer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=face',
    profile: {
      college: 'Indian Institute of Technology',
      degree: 'B.Tech',
      stream: 'Data Science & AI',
      streamCode: 'DS',
      specialization: 'Large Language Models & Optimization',
      semester: 5,
      year: 3,
      cgpa: 9.54,
      careerGoal: 'AI Research Scientist / Foundation Model Engineer',
      bio: 'Working on transformer quantization, low-rank LoRA adaptation, and retrieval-augmented reasoning.',
      interests: ['Deep Learning', 'PyTorch', 'Transformer Models', 'Research', 'Competitive Programming'],
    },
    skills: [
      { name: 'PyTorch', category: 'Technical', level: 'Advanced', progress: 94, verified: true },
      { name: 'Transformer Architectures', category: 'Technical', level: 'Advanced', progress: 91, verified: true },
      { name: 'Python', category: 'Technical', level: 'Master', progress: 96, verified: true },
      { name: 'Vector DBs & LangChain', category: 'Technical', level: 'Advanced', progress: 85, verified: true },
      { name: 'Statistical Modeling', category: 'Technical', level: 'Advanced', progress: 88, verified: true },
    ],
    projects: [
      {
        name: 'FastAttention-CUDA',
        description: 'Custom Triton & CUDA kernel implementing FlashAttention v2 optimizations for small GPUs.',
        techStack: 'CUDA, Triton, PyTorch, C++',
        repoUrl: 'github.com/ananya/fast-attention',
        role: 'Lead ML Researcher',
      },
      {
        name: 'CampusRAG Academic Engine',
        description: 'Multi-modal retrieval system over 20,000 course PDFs with citation graph traversal.',
        techStack: 'Python, Qdrant, FastAPI, Next.js',
        repoUrl: 'github.com/ananya/campus-rag',
        role: 'Full Stack AI Lead',
      },
    ],
  },
  {
    email: 'rohan.mehta@nivora.edu',
    name: 'Rohan Mehta',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face',
    profile: {
      college: 'Galgotias University',
      degree: 'B.Tech',
      stream: 'Mechanical Engineering',
      streamCode: 'MECH',
      specialization: 'Robotics & Mechatronics',
      semester: 5,
      year: 3,
      cgpa: 8.85,
      careerGoal: 'Autonomous Robotics Hardware & Control Engineer',
      bio: 'Captain of University Rover Team. Specializing in inverse kinematics, brushless motor drives, and ROS2.',
      interests: ['Robotics', 'ROS2', '3D Printing', 'CAD/CAM', 'Automation', 'Formula Student'],
    },
    skills: [
      { name: 'ROS2 / Micro-ROS', category: 'Technical', level: 'Advanced', progress: 89, verified: true },
      { name: 'SolidWorks & Fusion 360', category: 'Technical', level: 'Advanced', progress: 92, verified: true },
      { name: 'Finite Element Analysis (FEA)', category: 'Technical', level: 'Intermediate', progress: 80, verified: true },
      { name: 'C++ for Embedded', category: 'Technical', level: 'Intermediate', progress: 76, verified: true },
      { name: 'Project Coordination', category: 'Leadership', level: 'Advanced', progress: 85, verified: true },
    ],
    projects: [
      {
        name: 'Mars Rover 6-DOF Robotic Arm',
        description: 'Lightweight carbon-fiber robotic arm with planetary gear reduction and closed-loop CAN bus telemetry.',
        techStack: 'SolidWorks, ANSYS, ROS2, Teensy 4.1',
        repoUrl: 'github.com/rohan/mars-arm-6dof',
        role: 'Mechanical Lead',
      },
      {
        name: 'Quadruped Robot Dynamic Gaits',
        description: '12-motor agile robot dog with MPC trajectory planning and sim-to-real Isaac Gym training.',
        techStack: 'PyBullet, C++, Python, BLDC',
        repoUrl: 'github.com/rohan/quadruped-mpc',
        role: 'Control Lead',
      },
    ],
  },
  {
    email: 'priya.nair@nivora.edu',
    name: 'Priya Nair',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face',
    profile: {
      college: 'Indian Institute of Technology',
      degree: 'B.Tech',
      stream: 'Electronics & Communication',
      streamCode: 'ECE',
      specialization: 'VLSI Digital Design & FPGA Acceleration',
      semester: 5,
      year: 3,
      cgpa: 9.15,
      careerGoal: 'VLSI Chip Architect / Silicon Validation Engineer',
      bio: 'Passionate about custom silicon, RISC-V extensions, SystemVerilog verification, and tape-out workflows.',
      interests: ['VLSI', 'RISC-V', 'FPGA', 'Semiconductors', 'Hardware Security', 'Embedded Systems'],
    },
    skills: [
      { name: 'SystemVerilog / Verilog', category: 'Technical', level: 'Advanced', progress: 91, verified: true },
      { name: 'RISC-V ISA Architecture', category: 'Technical', level: 'Advanced', progress: 87, verified: true },
      { name: 'FPGA Vivado / Quartus', category: 'Technical', level: 'Advanced', progress: 84, verified: true },
      { name: 'UVM Testbench Design', category: 'Technical', level: 'Intermediate', progress: 79, verified: true },
      { name: 'C / Bare-Metal Drivers', category: 'Technical', level: 'Intermediate', progress: 82, verified: true },
    ],
    projects: [
      {
        name: 'RV32IM 5-Stage Pipelined Core',
        description: 'Complete RV32IM processor with branch prediction, hazard forwarding, and AXI4-Lite memory bus.',
        techStack: 'SystemVerilog, Vivado, Verilator',
        repoUrl: 'github.com/priya/rv32im-core',
        role: 'Digital Designer',
      },
      {
        name: 'CNN Hardware Accelerator on Zynq',
        description: 'Quantized INT8 systolic array accelerating convolution operations on Xilinx Zynq-7000 FPGA.',
        techStack: 'HLS, C++, Verilog, Python',
        repoUrl: 'github.com/priya/fpga-systolic-array',
        role: 'Hardware Accelerator Lead',
      },
    ],
  },
  {
    email: 'tanvi.deshmukh@nivora.edu',
    name: 'Tanvi Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=face',
    profile: {
      college: 'Galgotias University',
      degree: 'BBA',
      stream: 'Business Administration',
      streamCode: 'BBA',
      specialization: 'Product Strategy & Venture Capital',
      semester: 3,
      year: 2,
      cgpa: 9.2,
      careerGoal: 'Associate Product Manager / Tech Strategy Consultant',
      bio: 'Founder of Campus Consulting Club. Analyzing SaaS unit economics, growth loops, and go-to-market strategies.',
      interests: ['Product Management', 'Venture Capital', 'Financial Modeling', 'Market Analysis', 'Design Thinking'],
    },
    skills: [
      { name: 'Financial Modeling & Valuation', category: 'Professional', level: 'Advanced', progress: 88, verified: true },
      { name: 'Product Roadmapping & Wireframing', category: 'Professional', level: 'Advanced', progress: 86, verified: true },
      { name: 'SQL & Tableau Analytics', category: 'Technical', level: 'Intermediate', progress: 80, verified: true },
      { name: 'Stakeholder Communication', category: 'Leadership', level: 'Advanced', progress: 92, verified: true },
    ],
    projects: [
      {
        name: 'EdTech Market Penetration Dossier',
        description: '30-page quantitative market research and pricing elasticity model for student productivity SaaS.',
        techStack: 'Excel DCF, Tableau, Notion, SQL',
        repoUrl: 'github.com/tanvi/saas-gtm-dossier',
        role: 'Lead Strategist',
      },
    ],
  },
  {
    email: 'karan.singh@nivora.edu',
    name: 'Karan Singh',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face',
    profile: {
      college: 'Indian Institute of Technology',
      degree: 'B.Tech',
      stream: 'Computer Science',
      streamCode: 'CSE',
      specialization: 'Full Stack & Mobile Architecture',
      semester: 5,
      year: 3,
      cgpa: 8.95,
      careerGoal: 'Principal Full Stack Architect',
      bio: 'Building hyper-fluid student platforms, real-time web sockets, and high-performance WebGL graphics.',
      interests: ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'WebSockets', 'UI/UX Design'],
    },
    skills: [
      { name: 'TypeScript & React', category: 'Technical', level: 'Master', progress: 96, verified: true },
      { name: 'Next.js App Router', category: 'Technical', level: 'Master', progress: 95, verified: true },
      { name: 'PostgreSQL & Prisma', category: 'Technical', level: 'Advanced', progress: 90, verified: true },
      { name: 'Tailwind CSS', category: 'Technical', level: 'Master', progress: 98, verified: true },
      { name: 'UI / UX Interaction Design', category: 'Creative', level: 'Advanced', progress: 89, verified: true },
    ],
    projects: [
      {
        name: 'FluidCanvas Collaborative Board',
        description: 'Multiplayer low-latency collaborative whiteboarding engine with CRDTs and WebRTC data channels.',
        techStack: 'Next.js, TypeScript, Yjs, WebRTC, Tailwind',
        repoUrl: 'github.com/karan/fluid-canvas',
        role: 'Full Stack Lead',
      },
    ],
  },
];

async function seedStudents() {
  console.log('Seeding student networking profiles...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Enrich existing users with skills & projects if missing
  const existingUsers = await prisma.user.findMany({
    include: { profile: true, skills: true, projects: true },
  });

  for (const u of existingUsers) {
    if (u.skills.length === 0) {
      await prisma.skill.createMany({
        data: [
          { userId: u.id, name: 'Data Structures & Algorithms', category: 'Technical', level: 'Advanced', progress: 88, verified: true },
          { userId: u.id, name: 'System Design', category: 'Technical', level: 'Intermediate', progress: 80, verified: true },
          { userId: u.id, name: 'Distributed Systems', category: 'Technical', level: 'Intermediate', progress: 75, verified: true },
          { userId: u.id, name: 'TypeScript & Node.js', category: 'Technical', level: 'Advanced', progress: 85, verified: true },
        ],
      });
    }

    if (u.projects.length === 0) {
      await prisma.project.create({
        data: {
          userId: u.id,
          name: 'Distributed KV Cache',
          description: 'High performance in-memory caching cluster with consistent hashing and replication.',
          techStack: 'Go, gRPC, Redis, Docker',
          repoUrl: 'github.com/student/distributed-cache',
          role: 'Backend Architect',
        },
      });
    }

    if (!u.profile?.interests || u.profile.interests.length === 0) {
      await prisma.studentProfile.update({
        where: { userId: u.id },
        data: {
          interests: ['Computer Science', 'Distributed Systems', 'Cloud', 'Open Source', 'Hackathons'],
          bio: u.profile?.bio || 'Passionate student exploring high performance computing and system architecture.',
        },
      });
    }
  }

  // 2. Upsert sample students for diverse discovery & suggestions
  for (const s of SAMPLE_STUDENTS) {
    const existing = await prisma.user.findUnique({
      where: { email: s.email },
      include: { profile: true },
    });

    let userId = existing?.id;

    if (!existing) {
      const created = await prisma.user.create({
        data: {
          email: s.email,
          name: s.name,
          passwordHash,
          avatar: s.avatar,
          profile: {
            create: s.profile,
          },
        },
      });
      userId = created.id;
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: {
          name: s.name,
          avatar: s.avatar,
        },
      });
      await prisma.studentProfile.update({
        where: { userId },
        data: s.profile,
      });
    }

    // Upsert skills
    await prisma.skill.deleteMany({ where: { userId } });
    await prisma.skill.createMany({
      data: s.skills.map((sk) => ({ ...sk, userId: userId! })),
    });

    // Upsert projects
    await prisma.project.deleteMany({ where: { userId } });
    await prisma.project.createMany({
      data: s.projects.map((p) => ({ ...p, userId: userId! })),
    });
  }

  // 3. Create a couple of sample pending/accepted connections between sample users for testing
  const allUsers = await prisma.user.findMany({ select: { id: true, name: true, email: true } });
  if (allUsers.length >= 4) {
    const u1 = allUsers[0];
    const u2 = allUsers[1];
    const u3 = allUsers[2];
    const u4 = allUsers[3];

    // u1 <-> u2 Accepted
    await prisma.studentConnection.upsert({
      where: { senderId_receiverId: { senderId: u1.id, receiverId: u2.id } },
      create: { senderId: u1.id, receiverId: u2.id, status: 'ACCEPTED', note: 'Hey! Loved your Raft project.' },
      update: { status: 'ACCEPTED' },
    });

    // u3 -> u1 Pending (incoming to u1)
    await prisma.studentConnection.upsert({
      where: { senderId_receiverId: { senderId: u3.id, receiverId: u1.id } },
      create: { senderId: u3.id, receiverId: u1.id, status: 'PENDING', note: 'Hi! Would love to collaborate on the upcoming hackathon.' },
      update: { status: 'PENDING' },
    });

    // u1 -> u4 Pending (outgoing from u1)
    await prisma.studentConnection.upsert({
      where: { senderId_receiverId: { senderId: u1.id, receiverId: u4.id } },
      create: { senderId: u1.id, receiverId: u4.id, status: 'PENDING', note: 'Hey! Saw your robotics research, great work!' },
      update: { status: 'PENDING' },
    });
  }

  console.log('Successfully seeded students and connections!');
}

seedStudents().catch(console.error);
