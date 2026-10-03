import prisma from '../src/lib/prisma';
import { CURRICULUM_DATA } from '../src/lib/curriculumData';

interface ResourceSeedItem {
  title: string;
  description: string;
  type: 'video' | 'article' | 'pdf' | 'notes' | 'documentation';
  url: string;
  thumbnailUrl?: string;
  channel?: string;
  duration?: string;
  fileSize?: string;
  author: string;
  topicTitleMatch: string; // matches topic title substring
}

const RESOURCE_DATABASE: Record<string, ResourceSeedItem[]> = {
  // CSE201 / Data Structures
  'Data Structures': [
    {
      title: 'Arrays & Dynamic Array Resizing In-Depth',
      description: 'Comprehensive analysis of memory allocation, amortized O(1) resizing, and cache locality for contiguous arrays.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=pmN9ExfY3yU',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&auto=format&fit=crop&q=80',
      channel: 'Abdul Bari',
      duration: '22:15',
      author: 'Prof. Abdul Bari',
      topicTitleMatch: 'Array',
    },
    {
      title: 'Dynamic Array Implementation in C/C++',
      description: 'Step-by-step memory pointer management and growth factor benchmarks across glibc std::vector.',
      type: 'article',
      url: 'https://geeksforgeeks.org/how-do-dynamic-arrays-work/',
      author: 'Algorithms & Systems Journal',
      topicTitleMatch: 'Array',
    },
    {
      title: 'Singly and Doubly Linked Lists from Scratch',
      description: 'Pointer manipulation, sentinel nodes, edge cases in node reversal, and time complexity tradeoffs vs arrays.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=F8AbOfQwl1c',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
      channel: 'freeCodeCamp.org',
      duration: '38:40',
      author: 'Beau Carnes',
      topicTitleMatch: 'Linked List',
    },
    {
      title: 'Linked List Memory Footprint & Pointer Overhead Reference',
      description: 'Complete PDF handbook on pointer memory boundaries, memory fragmentation, and cache miss rates in linked structures.',
      type: 'pdf',
      url: 'https://web.stanford.edu/class/cs106b/handouts/linked-lists.pdf',
      fileSize: '3.4 MB',
      author: 'Stanford Computer Science Dept',
      topicTitleMatch: 'Linked List',
    },
    {
      title: 'Stacks and Queues: Array vs Linked List Implementations',
      description: 'LIFO and FIFO operations, call stack mechanics, queue ring buffers, and circular buffer architectures.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=wjI1WNcIntg',
      thumbnailUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&auto=format&fit=crop&q=80',
      channel: 'CS Dojo',
      duration: '18:50',
      author: 'CS Dojo',
      topicTitleMatch: 'Stack',
    },
    {
      title: 'Binary Search Trees & AVL Tree Rotations Explained',
      description: 'Visual walkthrough of BST invariants, LL/RR/LR/RL balancing rotations, and strict height guarantees.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=vRwi_UcZGjU',
      thumbnailUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80',
      channel: 'Abdul Bari',
      duration: '42:10',
      author: 'Prof. Abdul Bari',
      topicTitleMatch: 'Tree',
    },
    {
      title: 'AVL & Red-Black Balanced Binary Trees Formal Proofs',
      description: 'Rigorous balance factor invariants, re-coloring cases, and worst-case logarithmic search proofs.',
      type: 'documentation',
      url: 'https://en.wikipedia.org/wiki/Self-balancing_binary_search_tree',
      author: 'NIVORA Academic Archives',
      topicTitleMatch: 'Tree',
    },
    {
      title: 'Graph Traversals: Breadth-First & Depth-First Search',
      description: 'Graph representation via adjacency matrix vs lists, queue-based BFS, recursive DFS, and cycle detection.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=pcKY4hjDrxk',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&auto=format&fit=crop&q=80',
      channel: 'WilliamFiset',
      duration: '28:15',
      author: 'William Fiset',
      topicTitleMatch: 'Graph',
    },
    {
      title: 'QuickSort vs MergeSort: Formal Divide & Conquer Analysis',
      description: 'Master theorem recurrence relations, in-place partitioning schemes, and cache performance.',
      type: 'article',
      url: 'https://algs4.cs.princeton.edu/20sorting/',
      author: 'Sedgewick & Wayne',
      topicTitleMatch: 'Sorting',
    },
  ],

  // DBMS
  'Database Management Systems': [
    {
      title: 'Relational Database Architecture & SQL Execution Pipeline',
      description: 'Query parsing, catalog lookup, logical and physical query optimization, buffer pool managers, and storage engines.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=OEWxS8gGzD8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&auto=format&fit=crop&q=80',
      channel: 'Carnegie Mellon Database Group',
      duration: '1:14:20',
      author: 'Prof. Andy Pavlo',
      topicTitleMatch: 'Relational',
    },
    {
      title: 'Database Normalization: 1NF, 2NF, 3NF, and BCNF with Real Schemas',
      description: 'Functional dependencies, Armstrong axioms, lossless join decomposition, and dependency preservation proofs.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=UrYLYV7WSHM',
      thumbnailUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&auto=format&fit=crop&q=80',
      channel: 'Deconstruct Database',
      duration: '34:10',
      author: 'Dr. K. Sharma',
      topicTitleMatch: 'Normal',
    },
    {
      title: 'Database System Concepts: Normalization Reference Notes',
      description: 'Complete faculty syllabus lecture notes covering schema design anomalies, candidate keys, and multi-valued dependencies.',
      type: 'pdf',
      url: 'https://www.db-book.com/slides-dir/PDF-dir/ch7.pdf',
      fileSize: '2.1 MB',
      author: 'Silberschatz, Korth & Sudarshan',
      topicTitleMatch: 'Normal',
    },
    {
      title: 'Transaction Concurrency, ACID Properties, and Two-Phase Locking',
      description: 'Serializability theory, conflict serializability graphs, deadlocks, and strict 2PL locking protocols in modern DBMS.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=0kF6l4eK7L4',
      thumbnailUrl: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&auto=format&fit=crop&q=80',
      channel: 'Carnegie Mellon Database Group',
      duration: '1:08:45',
      author: 'Prof. Andy Pavlo',
      topicTitleMatch: 'Transaction',
    },
    {
      title: 'PostgreSQL Official Documentation: Concurrency & MVCC',
      description: 'Multi-Version Concurrency Control (MVCC) internals, snapshot isolation, vacuuming, and transaction isolation levels.',
      type: 'documentation',
      url: 'https://www.postgresql.org/docs/current/mvcc.html',
      author: 'PostgreSQL Global Development Group',
      topicTitleMatch: 'Transaction',
    },
    {
      title: 'B+ Tree Indexing & High-Performance Page Splitting',
      description: 'Internal and leaf node layouts, search traversal, node splits, merges, and pointer swizzling in disk-oriented engines.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=aZjYr87r1b8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&auto=format&fit=crop&q=80',
      channel: 'MIT 6.830 Database Systems',
      duration: '52:30',
      author: 'MIT CSAIL',
      topicTitleMatch: 'Index',
    },
    {
      title: 'Distributed Databases & CAP Theorem in Cloud Storage',
      description: 'Horizontal partitioning (sharding), Paxos/Raft consensus, eventual consistency, and Dynamo/Spanner architectures.',
      type: 'article',
      url: 'https://martinfowler.com/articles/patterns-of-distributed-systems/',
      author: 'Martin Fowler & Unmesh Joshi',
      topicTitleMatch: 'Distributed',
    },
  ],

  // Operating Systems
  'Operating Systems': [
    {
      title: 'Operating System Kernel Architecture: Monolithic vs Microkernel',
      description: 'Dual-mode CPU execution (user/kernel mode), system calls via software interrupts, trap handlers, and context switches.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=26QPDBe-NB8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400&auto=format&fit=crop&q=80',
      channel: 'MIT 6.S081 Operating System Engineering',
      duration: '58:20',
      author: 'Prof. Robert Morris (MIT)',
      topicTitleMatch: 'Process',
    },
    {
      title: 'Process State Transitions, PCB, and fork() / exec() Pipeline',
      description: 'UNIX process hierarchy, zombie/orphan states, Process Control Block fields, and copy-on-write page semantics.',
      type: 'article',
      url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/cpu-api.pdf',
      author: 'Remzi Arpaci-Dusseau (OSTEP)',
      topicTitleMatch: 'Process',
    },
    {
      title: 'CPU Scheduling Algorithms: CFS, Multi-Level Feedback Queues',
      description: 'First-Come First-Served, Round Robin quantum tuning, Shortest Job First, and Linux Completely Fair Scheduler virtual runtime.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=EWkQl0n0w5M',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&auto=format&fit=crop&q=80',
      channel: 'Neso Academy',
      duration: '26:45',
      author: 'Neso Academy',
      topicTitleMatch: 'Schedul',
    },
    {
      title: 'Classic Synchronization: Semaphores, Mutexes, and Deadlocks',
      description: 'Critical section problem, Peterson algorithm, hardware atomic test-and-set, Banker algorithm for deadlock avoidance.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=ukM_zzrIeXs',
      thumbnailUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80',
      channel: 'Stanford CS110',
      duration: '48:10',
      author: 'Prof. Jerry Cain (Stanford)',
      topicTitleMatch: 'Deadlock',
    },
    {
      title: 'Virtual Memory, Multi-Level Page Tables, and TLB Mechanics',
      description: 'Hardware MMU translation, inverted page tables, Translation Lookaside Buffer hits/misses, and page fault interrupt flow.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=qcBIvnQt0Bw',
      thumbnailUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=80',
      channel: 'MIT OpenCourseWare',
      duration: '1:02:15',
      author: 'Prof. Frans Kaashoek',
      topicTitleMatch: 'Memory',
    },
  ],

  // Computer Networks
  'Computer Networks': [
    {
      title: 'TCP/IP vs OSI Protocol Stack: End-to-End Packet Lifecycle',
      description: 'Encapsulation, headers, framing, socket abstraction, and packet routing through switches, routers, and gateways.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=3b_TMCsiRQ8',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80',
      channel: 'Ben Eater',
      duration: '21:30',
      author: 'Ben Eater',
      topicTitleMatch: 'OSI',
    },
    {
      title: 'IPv4 Addressing, Subnetting, and CIDR Notation Masterclass',
      description: 'Network vs host bits, subnet masking calculations, broadcast addresses, and hierarchical route aggregation.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=s_Ntt6eTn94',
      thumbnailUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&auto=format&fit=crop&q=80',
      channel: 'NetworkChuck',
      duration: '31:40',
      author: 'NetworkChuck',
      topicTitleMatch: 'Addressing',
    },
    {
      title: 'TCP 3-Way Handshake, Sliding Window, and Congestion Control',
      description: 'SYN/ACK sequence numbers, flow control window size, AIMD, Slow Start, Fast Retransmit, and BBR algorithms.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=F27PLuhDY-0',
      thumbnailUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&auto=format&fit=crop&q=80',
      channel: 'Computerphile',
      duration: '19:25',
      author: 'Prof. Steve Bagley',
      topicTitleMatch: 'Transport',
    },
    {
      title: 'RFC 793: Transmission Control Protocol Specification',
      description: 'The standard IETF specification defining state diagrams, segment headers, and connection lifecycle.',
      type: 'documentation',
      url: 'https://datatracker.ietf.org/doc/html/rfc793',
      author: 'Internet Engineering Task Force (IETF)',
      topicTitleMatch: 'Transport',
    },
  ],

  // Problem Solving & Python Programming (Sem 1)
  'Python Programming': [
    {
      title: 'Python for Beginners: Core Syntax, Data Structures & Logic',
      description: 'Variables, dynamic typing, control flow, functions, list comprehensions, and dictionaries.',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      thumbnailUrl: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&auto=format&fit=crop&q=80',
      channel: 'Programming with Mosh',
      duration: '1:00:15',
      author: 'Mosh Hamedani',
      topicTitleMatch: 'Syntax',
    },
    {
      title: 'Python 3.12 Official Documentation & Language Reference',
      description: 'Standard library reference, built-in types, file I/O protocols, and exceptions hierarchy.',
      type: 'documentation',
      url: 'https://docs.python.org/3/',
      author: 'Python Software Foundation',
      topicTitleMatch: 'Python',
    },
    {
      title: 'Functional Programming & File Streams in Python',
      description: 'Map, filter, lambda closures, context managers (`with` statement), and robust exception handling.',
      type: 'article',
      url: 'https://realpython.com/python-functional-programming/',
      author: 'Real Python Editorial',
      topicTitleMatch: 'Function',
    },
  ],
};

async function main() {
  console.log('Seeding Academic Curriculum Subjects, Topics, and Resources...');

  const cseCurriculum = CURRICULUM_DATA['B.Tech']?.branches['CSE'];
  if (!cseCurriculum) {
    throw new Error('CSE Curriculum not found');
  }

  // Iterate through all semesters 1 through 8
  for (let sem = 1; sem <= 8; sem++) {
    const subjects = cseCurriculum.semesters[sem] || [];
    console.log(`Processing Semester ${sem} (${subjects.length} subjects)...`);

    for (const sub of subjects) {
      // 1. Upsert Subject
      const dbSubject = await prisma.subject.upsert({
        where: { code: sub.code },
        update: {
          name: sub.name,
          credits: sub.credits,
          semester: sub.semester,
          streamCode: 'CSE',
          instructor: sub.instructor || 'Faculty Auth',
          room: sub.room || 'Academic Block A',
        },
        create: {
          code: sub.code,
          name: sub.name,
          credits: sub.credits,
          semester: sub.semester,
          streamCode: 'CSE',
          instructor: sub.instructor || 'Faculty Auth',
          room: sub.room || 'Academic Block A',
        },
      });

      // 2. Upsert Topics
      for (let i = 0; i < sub.topics.length; i++) {
        const topicTitle = sub.topics[i];
        const existingTopic = await prisma.topic.findFirst({
          where: { subjectId: dbSubject.id, title: topicTitle },
        });

        const topic = existingTopic
          ? await prisma.topic.update({
              where: { id: existingTopic.id },
              data: { order: i + 1, unitNumber: Math.floor(i / 2) + 1, unitName: `Unit ${Math.floor(i / 2) + 1}` },
            })
          : await prisma.topic.create({
              data: {
                subjectId: dbSubject.id,
                title: topicTitle,
                description: `Fundamental mastery and practical engineering applications of ${topicTitle}.`,
                order: i + 1,
                unitNumber: Math.floor(i / 2) + 1,
                unitName: `Unit ${Math.floor(i / 2) + 1}`,
                status: 'pending',
                masteryPercent: 0,
              },
            });

        // 3. Check for matching curated resources in RESOURCE_DATABASE
        for (const [key, resourceList] of Object.entries(RESOURCE_DATABASE)) {
          if (sub.name.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(sub.name.toLowerCase())) {
            for (const resItem of resourceList) {
              if (topic.title.toLowerCase().includes(resItem.topicTitleMatch.toLowerCase())) {
                const existingRes = await prisma.resource.findFirst({
                  where: { subjectId: dbSubject.id, title: resItem.title },
                });

                if (!existingRes) {
                  await prisma.resource.create({
                    data: {
                      subjectId: dbSubject.id,
                      topicId: topic.id,
                      title: resItem.title,
                      description: resItem.description,
                      type: resItem.type,
                      url: resItem.url,
                      thumbnailUrl: resItem.thumbnailUrl,
                      channel: resItem.channel,
                      duration: resItem.duration,
                      fileSize: resItem.fileSize || '3.5 MB',
                      author: resItem.author,
                      tags: `${topic.title}, ${sub.name}, Core`,
                    },
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  const subjectCount = await prisma.subject.count();
  const topicCount = await prisma.topic.count();
  const resourceCount = await prisma.resource.count();

  console.log(`\n✅ Seeding complete! Database totals:`);
  console.log(`   - Subjects:  ${subjectCount}`);
  console.log(`   - Topics:    ${topicCount}`);
  console.log(`   - Resources: ${resourceCount}`);
}

main()
  .catch((err) => {
    console.error('Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
