/**
 * Centralized Academic Curriculum Data Structure
 *
 * Designed for B.Tech Computer Science & Engineering (Semesters 1–8)
 * Structured for future extensibility:
 * B.Tech -> CSE, IT, ECE, ME, etc.
 * Other Degrees -> BCA, MCA, etc.
 */

export type SubjectType = 'Core' | 'Elective' | 'Lab' | 'Practical' | 'Project';

export interface CurriculumSubject {
  id: string;
  code: string;
  name: string;
  credits: number;
  type: SubjectType;
  semester: number;
  description: string;
  topics: string[];
  department?: string;
  instructor?: string;
  room?: string;
}

export interface BranchCurriculum {
  branchId: string;
  branchName: string;
  streamCode: string;
  semesters: Record<number, CurriculumSubject[]>;
}

export interface DegreeCurriculum {
  degreeId: string;
  degreeName: string;
  branches: Record<string, BranchCurriculum>;
}

export const CURRICULUM_DATA: Record<string, DegreeCurriculum> = {
  'B.Tech': {
    degreeId: 'B.Tech',
    degreeName: 'Bachelor of Technology (B.Tech)',
    branches: {
      CSE: {
        branchId: 'CSE',
        branchName: 'Computer Science & Engineering',
        streamCode: 'CSE',
        semesters: {
          /* ── Semester 1 ─────────────────────────────── */
          1: [
            {
              id: 'btech-cse-sem1-mat101',
              code: 'MAT101',
              name: 'Engineering Mathematics I',
              credits: 4,
              type: 'Core',
              semester: 1,
              description: 'Matrix algebra, eigen-decomposition, differential calculus, curvature, and multivariable limits.',
              topics: ['Matrices & Determinants', 'Eigenvalues & Cayley-Hamilton', 'Differential Calculus', 'Partial Differentiation', 'Taylor & Maclaurin Series'],
              instructor: 'Dr. S. K. Mukherjee',
              room: 'Hall A-101',
            },
            {
              id: 'btech-cse-sem1-phy101',
              code: 'PHY101',
              name: 'Engineering Physics',
              credits: 4,
              type: 'Core',
              semester: 1,
              description: 'Wave optics, lasers, quantum mechanics foundation, solid state physics, and semiconductor fundamentals.',
              topics: ['Interference & Diffraction', 'Lasers & Fiber Optics', 'Quantum Mechanics Wavefunction', 'Crystal Lattices & Semiconductors'],
              instructor: 'Prof. R. Banerjee',
              room: 'Physics Lecture Hall 2',
            },
            {
              id: 'btech-cse-sem1-bee101',
              code: 'BEE101',
              name: 'Basic Electrical & Electronics Engineering',
              credits: 3,
              type: 'Core',
              semester: 1,
              description: 'DC & AC circuit theorems, transformers, PN junction diodes, BJT transistors, and fundamental logic gates.',
              topics: ['Kirchhoff Laws & Thevenin Theorem', 'Single Phase AC Circuits', 'Transformers & Induction Motors', 'Diodes & Transistors', 'Digital Logic Gates'],
              instructor: 'Dr. V. Iyer',
              room: 'Electrical Block Hall 1',
            },
            {
              id: 'btech-cse-sem1-cse101',
              code: 'CSE101',
              name: 'Problem Solving & Python Programming',
              credits: 3,
              type: 'Core',
              semester: 1,
              description: 'Algorithmic thinking, flowcharting, control structures, functional decomposition, and basic data structures in Python.',
              topics: ['Algorithms & Flowcharts', 'Python Syntax & Conditionals', 'Loops & Functions', 'Strings, Lists & Tuples', 'Dictionaries & File I/O'],
              instructor: 'Prof. Ananya Sen',
              room: 'Turing Hall 3',
            },
            {
              id: 'btech-cse-sem1-cse111',
              code: 'CSE111',
              name: 'Python Programming Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 1,
              description: 'Practical programming exercises in Python covering algorithmic problem solving, string parsing, and data manipulation.',
              topics: ['Basic Syntax & Conditionals', 'Iteration & String Manipulations', 'List Comprehensions & Recursion', 'File Handling & JSON Parsing'],
              instructor: 'Prof. Ananya Sen',
              room: 'Computing Lab 1',
            },
            {
              id: 'btech-cse-sem1-phy111',
              code: 'PHY111',
              name: 'Engineering Physics Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 1,
              description: 'Laboratory experiments in diffraction grating, spectrometer calibration, Planck constant measurement, and semiconductor bandgap.',
              topics: ['Diffraction Grating Calibration', 'Hall Effect Measurement', 'He-Ne Laser Wavelength Verification', 'Zener Diode Characteristics'],
              instructor: 'Prof. R. Banerjee',
              room: 'Physics Lab 3',
            },
          ],

          /* ── Semester 2 ─────────────────────────────── */
          2: [
            {
              id: 'btech-cse-sem2-mat102',
              code: 'MAT102',
              name: 'Engineering Mathematics II',
              credits: 4,
              type: 'Core',
              semester: 2,
              description: 'Integral calculus, multiple integrals, vector calculus (Green, Gauss, Stokes theorems), and ordinary differential equations.',
              topics: ['Multiple Integrals (Double & Triple)', 'Vector Differential Calculus', 'Integral Theorems of Vector Fields', 'First & Second Order Linear ODEs'],
              instructor: 'Dr. S. K. Mukherjee',
              room: 'Hall A-102',
            },
            {
              id: 'btech-cse-sem2-cse102',
              code: 'CSE102',
              name: 'Programming in C & Data Handling',
              credits: 3,
              type: 'Core',
              semester: 2,
              description: 'Low-level computer memory models, pointers, pointer arithmetic, struct memory layout, heap management, and file systems in C.',
              topics: ['Memory Representation & Pointers', 'Dynamic Memory Allocation (malloc/free)', 'Structures, Unions & Bitfields', 'File Pointers & Stream I/O', 'Preprocessors & Modular C'],
              instructor: 'Dr. K. Sharma',
              room: 'Hall B-201',
            },
            {
              id: 'btech-cse-sem2-cse103',
              code: 'CSE103',
              name: 'Digital Logic & Computer Design',
              credits: 3,
              type: 'Core',
              semester: 2,
              description: 'Boolean algebra, Karnaugh maps, combinational circuits, sequential circuits, flip-flops, registers, and finite state machine design.',
              topics: ['Boolean Algebra & DeMorgan Theorems', 'K-Map Minimization & Quine-McCluskey', 'Multiplexers, Decoders & Adders', 'Flip-Flops (SR, JK, D, T)', 'Counters, Shift Registers & State Machines'],
              instructor: 'Prof. N. K. Roy',
              room: 'Hardware Hall 2',
            },
            {
              id: 'btech-cse-sem2-env101',
              code: 'ENV101',
              name: 'Environmental Science & Sustainability',
              credits: 2,
              type: 'Core',
              semester: 2,
              description: 'Ecosystem dynamics, natural resources, environmental degradation, electronic waste management, and green computing practices.',
              topics: ['Ecosystems & Biodiversity', 'Pollution Control & Regulations', 'E-Waste & Sustainable Tech', 'Renewable Energy Systems'],
              instructor: 'Dr. P. Deshmukh',
              room: 'Hall C-104',
            },
            {
              id: 'btech-cse-sem2-cse112',
              code: 'CSE112',
              name: 'C Programming & Linux CLI Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 2,
              description: 'Hands-on C programming on POSIX systems, pointer manipulation, gdb debugging, makefiles, and shell scripting.',
              topics: ['Pointer Arithmetic & Array Offsets', 'Struct Serialization & Dynamic Memory', 'GDB Debugging & Memory Leaks (Valgrind)', 'Linux Shell Commands & Bash Scripting'],
              instructor: 'Dr. K. Sharma',
              room: 'Systems Lab 1',
            },
            {
              id: 'btech-cse-sem2-cse113',
              code: 'CSE113',
              name: 'Digital Circuits Simulation Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 2,
              description: 'Hardware simulation of digital circuits, combinational logic synthesis, synchronous counter design using Verilog / Logic gates.',
              topics: ['Basic Gate Verification', '4-bit Ripple Carry Adder', 'JK Flip-Flop Master-Slave State Machines', 'Verilog HDL Combinational Modules'],
              instructor: 'Prof. N. K. Roy',
              room: 'Digital Electronics Lab',
            },
          ],

          /* ── Semester 3 ─────────────────────────────── */
          3: [
            {
              id: 'btech-cse-sem3-cs301',
              code: 'CS301',
              name: 'Data Structures & Algorithms',
              credits: 4,
              type: 'Core',
              semester: 3,
              description: 'Linear and non-linear data structures, asymptotic time/space complexity analysis, tree balancing, graph traversals, and hashing techniques.',
              topics: ['Asymptotic Analysis & Recurrences', 'Linked Lists, Stacks & Queues', 'Binary Search Trees & AVL Trees', 'Heaps & Priority Queues', 'Graph Traversals (BFS, DFS)', 'Hashing & Collision Resolution'],
              instructor: 'Prof. A. Bannerjee',
              room: 'Turing Lecture Hall 1',
            },
            {
              id: 'btech-cse-sem3-cs302',
              code: 'CS302',
              name: 'Database Management Systems',
              credits: 4,
              type: 'Core',
              semester: 3,
              description: 'Relational data model, relational algebra, SQL querying, functional dependencies, schema normalization (1NF-BCNF), transaction management, and indexing.',
              topics: ['Relational Model & Constraints', 'Complex SQL & Relational Algebra', 'Schema Normalization (1NF to BCNF)', 'Indexing (B-Tree, B+ Tree, Hashing)', 'Transaction ACID Properties & 2PL Concurrency'],
              instructor: 'Dr. K. Sharma',
              room: 'Block C, Hall B-204',
            },
            {
              id: 'btech-cse-sem3-cs303',
              code: 'CS303',
              name: 'Object Oriented Programming with Java',
              credits: 3,
              type: 'Core',
              semester: 3,
              description: 'Object-oriented paradigm, classes, polymorphism, interfaces, exception handling, multithreading, collections framework, and JVM architecture.',
              topics: ['OOP Pillars & Encapsulation', 'Inheritance & Virtual Functions', 'Interfaces & Abstract Classes', 'Exception Handling & Generics', 'Multithreading & Synchronization', 'Java Collections Framework'],
              instructor: 'Dr. Meenakshi Sundaram',
              room: 'Software Studio 2',
            },
            {
              id: 'btech-cse-sem3-cs304',
              code: 'CS304',
              name: 'Computer Organization & Architecture',
              credits: 3,
              type: 'Core',
              semester: 3,
              description: 'Von Neumann machine architecture, instruction set architectures, arithmetic logic units, pipelining hazards, cache memory hierarchy, and virtual memory.',
              topics: ['Instruction Cycle & Addressing Modes', 'ALU Design & Booth Multiplication', 'Instruction Pipelining & Hazards', 'Memory Hierarchy & Cache Mapping', 'I/O Interfacing & DMA Controllers'],
              instructor: 'Prof. V. Raman',
              room: 'Systems Lab 3',
            },
            {
              id: 'btech-cse-sem3-mat201',
              code: 'MAT201',
              name: 'Discrete Mathematical Structures',
              credits: 3,
              type: 'Core',
              semester: 3,
              description: 'Mathematical logic, sets, relations, functions, graph theory, algebraic structures, recurrence relations, and combinatorics for computation.',
              topics: ['Propositional & Predicate Logic', 'Equivalence Relations & Posets', 'Recurrence Relations & Generating Functions', 'Graph Theory (Trees, Euler, Hamiltonian)', 'Groups, Rings & Lattice Structures'],
              instructor: 'Dr. Deepa Nair',
              room: 'Hall A-202',
            },
            {
              id: 'btech-cse-sem3-cs311',
              code: 'CS311',
              name: 'Data Structures Practicum Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 3,
              description: 'Implementation and benchmarking of balanced binary search trees, graph algorithms, priority queues, and sorting paradigms in C++.',
              topics: ['Stack & Queue Implementations', 'Self-Balancing BST (AVL / Red-Black)', 'Dijkstra & Prim Graph Algorithms', 'Custom Hash Table with Chaining'],
              instructor: 'Prof. A. Bannerjee',
              room: 'Computing Lab 2',
            },
            {
              id: 'btech-cse-sem3-cs312',
              code: 'CS312',
              name: 'Database Engineering Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 3,
              description: 'Hands-on relational database design, complex nested SQL queries, stored procedures, trigger workflows, and index profiling in PostgreSQL.',
              topics: ['DDL/DML Schema Definition', 'Complex Joins, Aggregations & Views', 'PL/pgSQL Functions & Triggers', 'Query Execution Plan Analysis (EXPLAIN)'],
              instructor: 'Dr. K. Sharma',
              room: 'Database Lab B',
            },
          ],

          /* ── Semester 4 ─────────────────────────────── */
          4: [
            {
              id: 'btech-cse-sem4-cs401',
              code: 'CS401',
              name: 'Operating Systems',
              credits: 4,
              type: 'Core',
              semester: 4,
              description: 'Kernel architectures, process management, CPU scheduling algorithms, inter-process communication, concurrency primitives, deadlock handling, virtual memory paging, and storage.',
              topics: ['Kernel vs User Space & System Calls', 'Process Lifecycle & Context Switching', 'CPU Scheduling Algorithms', 'Semaphores, Mutexes & Classical Sync Problems', 'Deadlock Detection & Banker Algorithm', 'Paging, Segmentation & TLB'],
              instructor: 'Dr. V. Raman',
              room: 'Hall B-102',
            },
            {
              id: 'btech-cse-sem4-cs402',
              code: 'CS402',
              name: 'Design & Analysis of Algorithms',
              credits: 4,
              type: 'Core',
              semester: 4,
              description: 'Algorithm design paradigms: divide and conquer, greedy strategies, dynamic programming, network flow, amortized analysis, and NP-completeness theory.',
              topics: ['Divide & Conquer (Strassen, FFT)', 'Greedy Algorithms (Huffman, Matroids)', 'Dynamic Programming (0/1 Knapsack, LCS)', 'Shortest Paths & Maximum Network Flow', 'Amortized Analysis', 'NP-Completeness & Reductions'],
              instructor: 'Prof. A. Bannerjee',
              room: 'Turing Lecture Hall 1',
            },
            {
              id: 'btech-cse-sem4-cs403',
              code: 'CS403',
              name: 'Theory of Computation',
              credits: 3,
              type: 'Core',
              semester: 4,
              description: 'Formal language theory, deterministic/non-deterministic finite automata, regular expressions, context-free grammars, pushdown automata, and Turing machine decidability.',
              topics: ['DFA, NFA & Regular Languages', 'Pumping Lemma for Regular Languages', 'Context-Free Grammars & Chomsky Normal Form', 'Pushdown Automata (PDA)', 'Turing Machines & The Halting Problem'],
              instructor: 'Prof. Sudip Das',
              room: 'Hall A-104',
            },
            {
              id: 'btech-cse-sem4-cs404',
              code: 'CS404',
              name: 'Computer Networks',
              credits: 3,
              type: 'Core',
              semester: 4,
              description: 'Layered networking models, framing, medium access protocols (CSMA/CD), IP addressing & CIDR, distance vector and link state routing, TCP congestion control, and DNS/HTTP protocols.',
              topics: ['Physical & Data Link Layers (Framing, CRC)', 'Ethernet & CSMA/CD Protocols', 'IPv4/IPv6 Addressing, Subnetting & CIDR', 'Routing Algorithms (OSPF, BGP)', 'TCP/UDP Protocols & Congestion Control', 'Application Protocols (DNS, TLS, HTTP/3)'],
              instructor: 'Prof. S. Sengupta',
              room: 'Hall B-101',
            },
            {
              id: 'btech-cse-sem4-cs405',
              code: 'CS405',
              name: 'Software Engineering & Agile Practices',
              credits: 3,
              type: 'Core',
              semester: 4,
              description: 'Software lifecycle models, agile Scrum framework, architectural design patterns, software testing strategies (unit, integration, regression), and CI/CD pipelines.',
              topics: ['Agile Scrum & Requirements Engineering', 'UML Structural & Behavioral Modeling', 'Creational, Structural & Behavioral Patterns', 'Test-Driven Development (TDD) & Mocking', 'Continuous Integration & Quality Metrics'],
              instructor: 'Dr. N. Roy',
              room: 'Software Studio 1',
            },
            {
              id: 'btech-cse-sem4-cs411',
              code: 'CS411',
              name: 'Operating Systems & Networking Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 4,
              description: 'POSIX system programming, fork/exec pipelines, POSIX thread synchronization, and client-server BSD socket programming.',
              topics: ['Process Management & Fork Trees', 'POSIX Mutexes & Condition Variables', 'Shared Memory & Named Pipes IPC', 'TCP Multi-client Echo Server with Sockets'],
              instructor: 'Dr. V. Raman',
              room: 'Systems Lab 3',
            },
            {
              id: 'btech-cse-sem4-cs412',
              code: 'CS412',
              name: 'Algorithms Benchmarking Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 4,
              description: 'Empirical runtime analysis of algorithmic solutions, dynamic programming memory profiling, and competitive programming optimization.',
              topics: ['Benchmarking Divide & Conquer Algorithms', 'Dynamic Programming vs Memoization Profiling', 'Ford-Fulkerson Network Flow Implementation', 'String Matching Algorithms (KMP, Rabin-Karp)'],
              instructor: 'Prof. A. Bannerjee',
              room: 'Computing Lab 2',
            },
          ],

          /* ── Semester 5 ─────────────────────────────── */
          5: [
            {
              id: 'btech-cse-sem5-cs501',
              code: 'CS501',
              name: 'Compiler Design',
              credits: 4,
              type: 'Core',
              semester: 5,
              description: 'Compiler architecture, lexical analysis, top-down and bottom-up parsing (LL, LR, LALR), syntax-directed translation, intermediate representations, and target code optimization.',
              topics: ['Lexical Analyzer Generation (Lex/Flex)', 'Context-Free Grammar Parsing (Yacc/Bison)', 'Syntax-Directed Definitions & Type Checking', 'Three-Address Code & Static Single Assignment', 'Control Flow Graphs & Loop Optimization', 'Register Allocation via Graph Coloring'],
              instructor: 'Dr. S. Sengupta',
              room: 'Hall B-202',
            },
            {
              id: 'btech-cse-sem5-cs502',
              code: 'CS502',
              name: 'Artificial Intelligence & Machine Learning',
              credits: 4,
              type: 'Core',
              semester: 5,
              description: 'Heuristic search algorithms (A*, Minimax), probabilistic reasoning, supervised learning algorithms (linear, logistic, decision trees, SVM), and clustering algorithms.',
              topics: ['Informed Search (A*, Branch & Bound)', 'Game Playing & Alpha-Beta Pruning', 'Supervised Learning (Regression & Classification)', 'Support Vector Machines & Kernel Methods', 'Unsupervised Learning (K-Means, PCA)', 'Model Validation & Bias-Variance Tradeoff'],
              instructor: 'Dr. Priyadarshini Rao',
              room: 'AI Center Auditorium',
            },
            {
              id: 'btech-cse-sem5-cs503',
              code: 'CS503',
              name: 'Microprocessors & Embedded Systems',
              credits: 3,
              type: 'Core',
              semester: 5,
              description: 'x86 and ARM processor architectures, assembly programming, hardware interrupt controllers, real-time operating systems, and microcontroller sensor interfacing.',
              topics: ['x86 Architecture & Register Set', 'Assembly Language Subroutines & Stack Frames', 'Interrupt Vectors & Hardware Timers', 'ARM Cortex-M Architecture', 'UART, SPI & I2C Bus Protocols'],
              instructor: 'Prof. C. Verma',
              room: 'Hardware Studio 1',
            },
            {
              id: 'btech-cse-sem5-cs504e',
              code: 'CS504E',
              name: 'Cloud Computing & Virtualization',
              credits: 3,
              type: 'Elective',
              semester: 5,
              description: 'Hypervisors, containerization (Docker internals), cloud storage architectures, distributed file systems, serverless computing, and AWS/Azure cloud primitives.',
              topics: ['Virtualization & Hypervisor Types', 'Container Internals (Namespaces & Cgroups)', 'Cloud Storage Models (Object, Block, File)', 'Serverless Functions (FaaS)', 'Cloud High Availability & Auto-scaling'],
              instructor: 'Prof. Alok Gupta',
              room: 'Cloud Lab Suite',
            },
            {
              id: 'btech-cse-sem5-cs511',
              code: 'CS511',
              name: 'AI & Machine Learning Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 5,
              description: 'Hands-on modeling with Python, NumPy, Pandas, Scikit-Learn, building classifiers, regressions, and evaluating feature importances.',
              topics: ['Data Preprocessing & Feature Engineering', 'Decision Trees & Random Forests with Scikit-Learn', 'Support Vector Machine Hyperplane Tuning', 'K-Means Clustering & Dimensionality Reduction'],
              instructor: 'Dr. Priyadarshini Rao',
              room: 'Machine Learning Lab',
            },
            {
              id: 'btech-cse-sem5-cs512',
              code: 'CS512',
              name: 'Compiler Engineering Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 5,
              description: 'Building a miniature compiler pipeline: generating lexical scanners, LALR grammar parsers with Flex/Bison, and producing abstract syntax trees.',
              topics: ['Token Scanner Construction with Flex', 'Grammar Rule Specification with Bison', 'AST Node Construction & Pretty Printing', 'Intermediate Representation Generation'],
              instructor: 'Dr. S. Sengupta',
              room: 'Systems Lab 2',
            },
          ],

          /* ── Semester 6 ─────────────────────────────── */
          6: [
            {
              id: 'btech-cse-sem6-cs601',
              code: 'CS601',
              name: 'Distributed Systems',
              credits: 4,
              type: 'Core',
              semester: 6,
              description: 'Distributed system models, logical clocks (Lamport, Vector), distributed mutual exclusion, leader election, consensus protocols (Raft, Paxos), and fault-tolerant storage.',
              topics: ['Distributed Architecture & Network Partitions', 'Logical Clocks & Causal Ordering', 'Consensus Algorithms (Raft & Paxos)', 'CAP Theorem & PACELC Tradeoffs', 'Distributed Transactions & 2PC', 'Failure Detection & Replication Models'],
              instructor: 'Dr. K. Sharma',
              room: 'Block C, Hall B-204',
            },
            {
              id: 'btech-cse-sem6-cs602',
              code: 'CS602',
              name: 'Cryptography & Network Security',
              credits: 4,
              type: 'Core',
              semester: 6,
              description: 'Mathematical foundations of cryptography, symmetric ciphers (AES), public key cryptography (RSA, ECC), cryptographic hashing, digital signatures, and TLS protocols.',
              topics: ['Number Theory (Modular Arithmetic, Primes)', 'Symmetric Ciphers & Block Cipher Modes (AES-GCM)', 'Public Key Cryptography (RSA & Elliptic Curves)', 'Hash Functions (SHA-256) & HMAC', 'Digital Signatures & Public Key Infrastructure', 'TLS Handshake & Network Attacks'],
              instructor: 'Prof. R. Mehta',
              room: 'Security Suite 1',
            },
            {
              id: 'btech-cse-sem6-cs603',
              code: 'CS603',
              name: 'Web Technologies & Distributed APIs',
              credits: 3,
              type: 'Core',
              semester: 6,
              description: 'Modern asynchronous web engineering, RESTful API design standards, WebSocket communications, GraphQL schema design, and microservices architecture.',
              topics: ['HTTP/2 & HTTP/3 Transport Protocols', 'REST Architectural Constraints & OpenAPI', 'WebSockets & Real-time Event Streams', 'GraphQL Schema & Resolvers', 'Microservices Gateway & Auth Architecture'],
              instructor: 'Prof. M. Iyer',
              room: 'Software Studio 2',
            },
            {
              id: 'btech-cse-sem6-cs604e',
              code: 'CS604E',
              name: 'Big Data Analytics & Stream Processing',
              credits: 3,
              type: 'Elective',
              semester: 6,
              description: 'Massive dataset processing architectures, MapReduce paradigms, Apache Spark in-memory computation, distributed message brokers (Kafka), and NoSQL engines.',
              topics: ['HDFS & Distributed Storage Foundations', 'Apache Spark RDD & DataFrames', 'Stream Processing Architectures (Kafka & Flink)', 'NoSQL Databases (Document, Columnar, Graph)', 'Large-scale Analytical Queries'],
              instructor: 'Dr. G. Kulkarni',
              room: 'Big Data Lab',
            },
            {
              id: 'btech-cse-sem6-cs611',
              code: 'CS611',
              name: 'Distributed Systems & Security Lab',
              credits: 1.5,
              type: 'Lab',
              semester: 6,
              description: 'Implementing consensus leader election prototypes in Go, cryptographic message signing with OpenSSL, and building secure gRPC distributed microservices.',
              topics: ['gRPC & Protocol Buffers in Go', 'Raft Consensus State Machine Implementation', 'OpenSSL Certificate Generation & RSA Signing', 'Fault-Tolerant Distributed Key-Value Store'],
              instructor: 'Dr. K. Sharma',
              room: 'Systems Lab 3',
            },
            {
              id: 'btech-cse-sem6-prj601',
              code: 'PRJ601',
              name: 'Capstone Mini-Project',
              credits: 2,
              type: 'Project',
              semester: 6,
              description: 'Student-led engineering project incorporating software design, architectural specification, version-controlled git workflow, and milestone demonstration.',
              topics: ['Problem Statement Definition', 'System Architecture & Data Schema', 'Proof-of-Concept Implementation', 'Sprint Demonstration & Defense'],
              instructor: 'Faculty Project Committee',
              room: 'Innovation Incubator',
            },
          ],

          /* ── Semester 7 ─────────────────────────────── */
          7: [
            {
              id: 'btech-cse-sem7-cs701',
              code: 'CS701',
              name: 'Deep Learning & Neural Networks',
              credits: 4,
              type: 'Core',
              semester: 7,
              description: 'Backpropagation, deep feedforward networks, convolutional neural networks (CNNs), recurrent networks (LSTM/GRU), Transformer architectures, and attention mechanisms.',
              topics: ['Gradient Descent Optimizers (Adam, RMSProp)', 'Convolutional Layers & Computer Vision (ResNet)', 'Sequence Modeling (LSTM & GRU)', 'Transformer Architecture & Self-Attention', 'Generative Adversarial Networks (GANs)', 'Model Quantization & Inference Optimization'],
              instructor: 'Dr. Priyadarshini Rao',
              room: 'AI Center Auditorium',
            },
            {
              id: 'btech-cse-sem7-cs702',
              code: 'CS702',
              name: 'High Performance & Parallel Computing',
              credits: 3,
              type: 'Core',
              semester: 7,
              description: 'Multi-core shared memory parallelism (OpenMP), distributed memory parallelism (MPI), and SIMD GPU programming with NVIDIA CUDA.',
              topics: ['Parallel Hardware Architectures & SIMD', 'Shared Memory Multithreading with OpenMP', 'Message Passing Interface (MPI) Clusters', 'NVIDIA CUDA Kernel & Memory Hierarchy', 'Parallel Algorithm Scaling (Amdahl & Gustafson)'],
              instructor: 'Prof. C. Verma',
              room: 'Supercomputing Facility',
            },
            {
              id: 'btech-cse-sem7-cs703e',
              code: 'CS703E',
              name: 'Natural Language Processing',
              credits: 3,
              type: 'Elective',
              semester: 7,
              description: 'Tokenization, n-gram language models, word embeddings (Word2Vec, GloVe), BERT pre-training, fine-tuning, and Large Language Model architectures.',
              topics: ['Text Normalization & Byte-Pair Encoding', 'Vector Semantics & Word2Vec Embeddings', 'BERT & Masked Language Modeling', 'Prompt Engineering & Fine-Tuning (LoRA)', 'Evaluation Metrics (BLEU, ROUGE, Perplexity)'],
              instructor: 'Dr. Deepa Nair',
              room: 'AI Center Hall 2',
            },
            {
              id: 'btech-cse-sem7-cs704e',
              code: 'CS704E',
              name: 'DevOps & Site Reliability Engineering',
              credits: 3,
              type: 'Elective',
              semester: 7,
              description: 'Infrastructure as Code (Terraform), Kubernetes cluster orchestration, continuous deployment pipelines, monitoring with Prometheus/Grafana, and incident response.',
              topics: ['Infrastructure as Code with Terraform', 'Kubernetes Pods, Services & Ingress Controllers', 'GitOps & CI/CD Pipelines', 'Prometheus Metrics & Distributed Tracing', 'SLI/SLO Engineering & Chaos Testing'],
              instructor: 'Prof. Alok Gupta',
              room: 'Cloud Lab Suite',
            },
            {
              id: 'btech-cse-sem7-prj701',
              code: 'PRJ701',
              name: 'Major Capstone Project (Phase I)',
              credits: 4,
              type: 'Project',
              semester: 7,
              description: 'Comprehensive research and development project under faculty guidance. Requirements specification, architectural design, and core implementation.',
              topics: ['Literature Survey & Problem Formulation', 'System Design Document & API Contracts', 'Core Engine Implementation', 'Interim Evaluation & Architecture Defense'],
              instructor: 'Capstone Advisory Panel',
              room: 'Innovation Incubator',
            },
            {
              id: 'btech-cse-sem7-int701',
              code: 'INT701',
              name: 'Industry Internship Practicum',
              credits: 2,
              type: 'Practical',
              semester: 7,
              description: 'Supervised industrial internship experience evaluating software engineering practices in production enterprise environments.',
              topics: ['Industry Project Deliverables', 'Production Code Review Standards', 'Technical Internship Monograph', 'Industry Mentor Evaluation'],
              instructor: 'Industry Relations Board',
              room: 'Corporate Placement Cell',
            },
          ],

          /* ── Semester 8 ─────────────────────────────── */
          8: [
            {
              id: 'btech-cse-sem8-prj801',
              code: 'PRJ801',
              name: 'Major Capstone Project (Final Phase)',
              credits: 10,
              type: 'Project',
              semester: 8,
              description: 'Culmination of engineering study. Production-grade deployment, performance benchmarking, rigorous validation, research dissemination, and final viva voce.',
              topics: ['Complete System Integration & Testing', 'Fault Tolerance & Performance Profiling', 'Research Paper / Patent Preparation', 'Final Project Viva Voce & Demonstration'],
              instructor: 'Senior Faculty Examination Board',
              room: 'Main Academic Auditorium',
            },
            {
              id: 'btech-cse-sem8-cs801e',
              code: 'CS801E',
              name: 'Quantum Computing & Information Theory',
              credits: 3,
              type: 'Elective',
              semester: 8,
              description: 'Qubits, quantum superposition, entanglement, quantum logic gates, Deutsch-Jozsa algorithm, Grover search algorithm, and Shor factoring algorithm.',
              topics: ['Qubits & Hilbert Space Mathematics', 'Quantum Superposition & Entanglement', 'Quantum Logic Gates & Quantum Circuits', 'Grover Quantum Search Algorithm', 'Shor Factorization & Post-Quantum Cryptography'],
              instructor: 'Prof. R. Banerjee',
              room: 'Physics Lecture Hall 1',
            },
            {
              id: 'btech-cse-sem8-oe801',
              code: 'OE801',
              name: 'Engineering Economics & Tech Entrepreneurship',
              credits: 3,
              type: 'Elective',
              semester: 8,
              description: 'Technology venture economics, discounted cash flow, product-market fit, cap tables, intellectual property monetization, and startup governance.',
              topics: ['Cost Principles, Cash Flow & Net Present Value', 'Venture Capital Economics & Equity Dilution', 'Product Discovery & Market Validation', 'Intellectual Property Licensing & Ethics'],
              instructor: 'Prof. R. Mehta',
              room: 'Management Hall 1',
            },
          ],
        },
      },
    },
  },
};

/**
 * Resolves curriculum subjects for a given degree, branch, and semester.
 * Defaults to B.Tech -> CSE if not specified.
 */
export function getCurriculumSubjects(
  degree: string = 'B.Tech',
  branch: string = 'CSE',
  semester: number = 1
): CurriculumSubject[] {
  // Normalize degree name matching
  const matchedDegreeKey = Object.keys(CURRICULUM_DATA).find(
    (k) => k.toLowerCase() === degree.toLowerCase() || degree.toLowerCase().includes('b.tech') || degree.toLowerCase().includes('btech')
  ) || 'B.Tech';

  const degreeObj = CURRICULUM_DATA[matchedDegreeKey];
  if (!degreeObj) return [];

  // Normalize branch name matching
  const matchedBranchKey = Object.keys(degreeObj.branches).find(
    (b) => b.toUpperCase() === branch.toUpperCase() || branch.toUpperCase().includes('CSE') || branch.toUpperCase().includes('COMPUTER')
  ) || 'CSE';

  const branchObj = degreeObj.branches[matchedBranchKey];
  if (!branchObj) return [];

  // Clamp semester to valid 1-8 range
  const validSemester = Math.max(1, Math.min(8, Math.round(semester)));
  return branchObj.semesters[validSemester] || [];
}

/**
 * Finds a subject by its code across all semesters of B.Tech CSE.
 */
export function getSubjectByCode(code: string): CurriculumSubject | undefined {
  if (!code) return undefined;
  const cleanCode = code.trim().toUpperCase().replace(/[-_\s]/g, '');

  const cse = CURRICULUM_DATA['B.Tech']?.branches['CSE'];
  if (!cse) return undefined;

  for (let sem = 1; sem <= 8; sem++) {
    const list = cse.semesters[sem] || [];
    for (const sub of list) {
      const subClean = sub.code.toUpperCase().replace(/[-_\s]/g, '');
      if (subClean === cleanCode || sub.id.toUpperCase() === code.toUpperCase()) {
        return sub;
      }
    }
  }

  return undefined;
}

/**
 * Returns available semesters for a degree and branch (e.g. [1, 2, 3, 4, 5, 6, 7, 8]).
 */
export function getAvailableSemesters(
  degree: string = 'B.Tech',
  branch: string = 'CSE'
): number[] {
  const matchedDegreeKey = Object.keys(CURRICULUM_DATA).find(
    (k) => k.toLowerCase() === degree.toLowerCase() || degree.toLowerCase().includes('b.tech')
  ) || 'B.Tech';

  const branchObj = CURRICULUM_DATA[matchedDegreeKey]?.branches[branch.toUpperCase()] || CURRICULUM_DATA['B.Tech']?.branches['CSE'];
  if (!branchObj) return [1, 2, 3, 4, 5, 6, 7, 8];

  return Object.keys(branchObj.semesters)
    .map(Number)
    .sort((a, b) => a - b);
}
