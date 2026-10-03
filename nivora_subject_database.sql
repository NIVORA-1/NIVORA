
-- NIVORA SUBJECT DATABASE
-- Schema + first verified seed: JNTUH B.Tech CSE, R25, AY 2025-26
-- Source: JNTUH official R25 CSE Course Structure & Syllabus

create extension if not exists pgcrypto;

create table if not exists universities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  normalized_name text not null,
  unique(name)
);

create table if not exists syllabus_versions (
  id uuid primary key default gen_random_uuid(),
  university_id uuid not null references universities(id) on delete cascade,
  branch_id uuid not null references branches(id) on delete cascade,
  regulation text,
  academic_year text,
  source_url text,
  unique(university_id, branch_id, regulation, academic_year)
);

create table if not exists subjects (
  id uuid primary key default gen_random_uuid(),
  syllabus_id uuid not null references syllabus_versions(id) on delete cascade,
  semester int not null check (semester between 1 and 8),
  code text,
  name text not null,
  subject_type text not null default 'core'
    check (subject_type in ('core','lab','elective','open_elective','project','internship','skill','audit','induction')),
  credits numeric(4,1),
  lecture_hours numeric(4,1),
  tutorial_hours numeric(4,1),
  practical_hours numeric(4,1),
  unique(syllabus_id, semester, name)
);

create index if not exists idx_subjects_lookup
on subjects(syllabus_id, semester);

-- University
insert into universities(name)
values ('Jawaharlal Nehru Technological University Hyderabad')
on conflict (name) do nothing;

-- Branch
insert into branches(name, normalized_name)
values ('Computer Science and Engineering', 'cse')
on conflict (name) do nothing;

-- Syllabus version
insert into syllabus_versions
(university_id, branch_id, regulation, academic_year, source_url)
select u.id, b.id, 'R25', '2025-2026',
'https://jntuh.ac.in/uploads/academics/R25B.TECH.CSECourseStructure.pdf'
from universities u, branches b
where u.name='Jawaharlal Nehru Technological University Hyderabad'
  and b.name='Computer Science and Engineering'
on conflict (university_id, branch_id, regulation, academic_year) do nothing;

-- Helper: insert subjects
insert into subjects
(syllabus_id, semester, code, name, subject_type, credits, lecture_hours, tutorial_hours, practical_hours)
select sv.id, x.sem, x.code, x.name, x.type, x.credits, x.l, x.t, x.p
from syllabus_versions sv
cross join (values
(1,'BSC','Matrices and Calculus','core',4,3,1,0),
(1,'BSC','Engineering Chemistry','core',3,3,0,0),
(1,'HSC','English for Skill Enhancement','core',3,3,0,0),
(1,'ESC','Electronic Devices and Circuits','core',3,3,0,0),
(1,'CSC','Programming for Problem Solving','core',3,3,0,0),
(1,'BSC','Engineering Chemistry Lab','lab',1,0,0,2),
(1,'CSC','Programming for Problem Solving Lab','lab',1,0,0,2),
(1,'HSC','English Language and Communication Skills Lab','lab',1,0,0,2),
(1,'MEC','Engineering Workshop','lab',1,0,0,2),
(2,'BSC','Ordinary Differential Equations and Vector Calculus','core',3,3,0,0),
(2,'BSC','Advanced Engineering Physics','core',3,3,0,0),
(2,'MEC','Computer Aided Engineering Graphics','core',3,2,0,2),
(2,'ESC','Basic Electrical Engineering','core',3,3,0,0),
(2,'ESC','Data Structures','core',3,3,0,0),
(2,'BSC','Advanced Engineering Physics Lab','lab',1,0,0,2),
(2,'ESC','Data Structures Lab','lab',1,0,0,2),
(2,'CSC','Python Programming Lab','lab',1,0,0,2),
(2,'ESC','Basic Electrical Engineering Lab','lab',1,0,0,2),
(2,'HSC','IT Workshop','lab',1,0,0,2),
(3,NULL,'Discrete Mathematics','core',3,3,0,0),
(3,NULL,'Computer Organization and Architecture','core',3,3,0,0),
(3,NULL,'Object Oriented Programming through java','core',3,3,0,0),
(3,NULL,'Software Engineering','core',3,3,0,0),
(3,NULL,'Data Base Management Systems','core',3,3,0,0),
(3,NULL,'Innovation and Entrepreneurship','core',2,2,0,0),
(3,NULL,'Object Oriented Programming through java Lab','lab',1,0,0,2),
(3,NULL,'Software Engineering Lab','lab',1,0,0,2),
(3,NULL,'Data Base Management Systems Lab','lab',1,0,0,2),
(3,NULL,'Node Js/React JS/Django','skill',1,0,0,2),
(3,NULL,'Environmental Science','audit',1,1,0,0),
(4,'BSC','Computer oriented Statistical Methods Mathematical','core',3,3,0,0),
(4,NULL,'Operating Systems','core',3,3,0,0),
(4,NULL,'Algorithm design and Analysis','core',3,3,0,0),
(4,NULL,'Computer Networks','core',3,3,0,0),
(4,NULL,'Machine Learning','core',3,3,0,0),
(4,NULL,'Computational Mathematics Lab','lab',1,0,0,2),
(4,NULL,'Operating Systems Lab','lab',1,0,0,2),
(4,NULL,'Computer Networks Lab','lab',1,0,0,2),
(4,NULL,'Machine Learning Lab','lab',1,0,0,2),
(4,NULL,'Data Visualization- R/Python/Power BI','skill',1,0,0,2),
(5,NULL,'Automata Theory and Compiler Design','core',3,3,0,0),
(5,NULL,'Artificial Intelligence','core',3,3,0,0),
(5,NULL,'DevOps','core',3,3,0,0),
(5,NULL,'Professional Elective-I','elective',3,3,0,0),
(5,NULL,'Open Elective-I','open_elective',2,2,0,0),
(5,NULL,'Compiler Design Lab','lab',1,0,0,2),
(5,NULL,'Artificial Intelligence with Python Lab','lab',1,0,0,2),
(5,NULL,'DevOps Lab','lab',1,0,0,2),
(5,NULL,'Field-Based Project/Internship','internship',2,0,0,4),
(5,NULL,'UI Design –Flutter/Android Studio','skill',1,0,0,2),
(5,NULL,'Indian Knowledge System','audit',1,1,0,0),
(6,NULL,'Cryptography and Networks Security','core',3,3,0,0),
(6,NULL,'Deep Learning','core',3,3,0,0),
(6,NULL,'Business Economics and Financial Analysis','core',3,3,0,0),
(6,NULL,'Professional Elective-II','elective',3,3,0,0),
(6,NULL,'Open Elective-II','open_elective',2,2,0,0),
(6,NULL,'Cryptography and Networks Security Lab','lab',1,0,0,2),
(6,NULL,'Deep Learning Lab','lab',1,0,0,2),
(6,NULL,'Advanced Data Structures using Python Lab','lab',1,0,0,2),
(6,NULL,'Advanced English Communication Skills Laboratory','lab',1,0,0,2),
(6,NULL,'Prompt Engineering','skill',1,0,0,2),
(6,NULL,'Gender Sensitization Lab / Human Values and Professional Ethics','audit',1,1,0,0),
(7,NULL,'Natural Language Processing','core',3,3,0,0),
(7,NULL,'Cyber Security','core',3,3,0,0),
(7,NULL,'Fundamentals of Management','core',3,3,0,0),
(7,NULL,'Professional Elective-III','elective',3,3,0,0),
(7,NULL,'Professional Elective-IV','elective',3,3,0,0),
(7,NULL,'Open Elective-III','open_elective',2,2,0,0),
(7,NULL,'Natural Language Processing Lab','lab',1,0,0,2),
(7,NULL,'Cyber Security Lab','lab',1,0,0,2),
(7,NULL,'Industry Oriented Mini Project/ Summer Internship','internship',2,0,0,4),
(8,NULL,'Professional Elective-V','elective',3,3,0,0),
(8,NULL,'Professional Elective-VI','elective',3,3,0,0),
(8,NULL,'Project Work','project',14,0,0,28)
) as x(sem,code,name,type,credits,l,t,p)
where sv.regulation='R25'
and sv.academic_year='2025-2026'
on conflict (syllabus_id, semester, name) do nothing;

-- Professional elective catalog (JNTUH R25 CSE)
insert into subjects(syllabus_id, semester, name, subject_type, credits)
select sv.id, x.sem, x.name, 'elective', 3
from syllabus_versions sv
cross join (values
(5,'Computer Graphics'),(5,'Introduction to Data Science'),(5,'Software Testing Methodologies'),
(5,'Data Mining'),(5,'Web Programming'),(5,'Distributed Systems'),
(6,'Image Processing'),(6,'Blockchain Technology'),(6,'Software Project Management'),
(6,'Mining Massive Datasets'),(6,'Full Stack Development'),(6,'Generative AI'),
(7,'Computer Vision'),(7,'Scripting Languages'),(7,'Vulnerability and Penetration Testing'),
(7,'Data Stream Mining'),(7,'Cloud Computing'),(7,'Information Retrieval Systems'),
(7,'Augmented Reality & Virtual Reality'),(7,'Agile Methodology'),(7,'Big Data Technologies'),
(7,'Quantum Computing'),(7,'Robotic Process Automation'),(7,'Cyber Forensics'),
(8,'Social Media Mining'),(8,'Nature Inspired Computing'),(8,'Internet of Things'),
(8,'Game Theory'),(8,'Mobile Application Development'),(8,'Human Computer Interaction'),
(8,'High Performance Computing'),(8,'Edge Computing'),(8,'Graph Theory'),
(8,'Adhoc and Sensor Networks'),(8,'Sustainable Engineering'),(8,'Distributed Databases')
) as x(sem,name)
where sv.regulation='R25' and sv.academic_year='2025-2026'
on conflict (syllabus_id, semester, name) do nothing;
