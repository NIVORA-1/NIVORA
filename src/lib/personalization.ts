export interface StreamConfig {
  code: string;
  name: string;
  degree: string;
  specializations: string[];
  defaultSubjects: { code: string; name: string; credits: number; instructor: string; room: string }[];
  careerRoadmap: { role: string; targetCompanies: string[]; keySkills: string[]; atsTarget: number };
  sampleInterviews: { title: string; topic: string; difficulty: string }[];
}

export const STREAMS: Record<string, StreamConfig> = {
  CSE: {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    degree: 'B.Tech',
    specializations: [
      'Systems & Distributed Computing',
      'Artificial Intelligence & Machine Learning',
      'Cybersecurity & Cryptography',
      'Full Stack Cloud Architectures'
    ],
    defaultSubjects: [
      { code: 'CS-301', name: 'Database Management Systems', credits: 4.0, instructor: 'Dr. K. Sharma', room: 'Hall B-204' },
      { code: 'CS-302', name: 'Data Structures & Algorithms', credits: 4.0, instructor: 'Prof. A. Bannerjee', room: 'Turing Hall 1' },
      { code: 'CS-303', name: 'Operating Systems & Concurrency', credits: 4.0, instructor: 'Dr. V. Raman', room: 'Systems Lab 3' },
      { code: 'CS-304', name: 'Computer Networks & Protocols', credits: 3.5, instructor: 'Prof. S. Sengupta', room: 'Hall B-102' },
    ],
    careerRoadmap: {
      role: 'Distributed Systems / Core Infrastructure Engineer',
      targetCompanies: ['Jane Street', 'Google Cloud', 'Meta', 'Goldman Sachs', 'Databricks'],
      keySkills: ['Go/Rust', 'Raft Consensus', 'B+ Trees', 'Distributed Tracing', 'Jepsen Chaos'],
      atsTarget: 96,
    },
    sampleInterviews: [
      { title: 'Distributed Consensus: Raft Partition Splits', topic: 'Quorum Rejection & Split-Brain Mitigation', difficulty: 'Advanced' },
      { title: 'B+ Tree Page Splitting & Concurrency', topic: 'Storage Engine Invariants', difficulty: 'Hard' },
    ]
  },
  BBA: {
    code: 'BBA',
    name: 'Business Administration & Management',
    degree: 'BBA (Hons)',
    specializations: [
      'Corporate Finance & Valuation',
      'Strategic Marketing & Brand Equity',
      'Supply Chain & Operations Analytics',
      'Venture Capital & Entrepreneurship'
    ],
    defaultSubjects: [
      { code: 'BBA-301', name: 'Strategic Marketing & Brand Equity', credits: 4.0, instructor: 'Prof. R. Mehta', room: 'Management Hall 4' },
      { code: 'BBA-302', name: 'Financial Modeling & DCF Valuation', credits: 4.0, instructor: 'Dr. S. Kapoor', room: 'Finance Lab A' },
      { code: 'BBA-303', name: 'Business Analytics & Decision Science', credits: 3.5, instructor: 'Prof. M. Iyer', room: 'Analytics Suite 2' },
      { code: 'BBA-304', name: 'Organizational Behavior & Negotiation', credits: 3.0, instructor: 'Dr. N. Roy', room: 'Seminar Hall 1' },
    ],
    careerRoadmap: {
      role: 'Investment Banking Analyst / Strategy Consultant',
      targetCompanies: ['McKinsey & Company', 'Boston Consulting Group', 'JPMorgan Chase', 'Morgan Stanley'],
      keySkills: ['LBO & DCF Modeling', 'Market Segmentation', 'Financial Statements', 'Pitch Presentation'],
      atsTarget: 94,
    },
    sampleInterviews: [
      { title: 'Market Sizing & Growth Strategy for SaaS', topic: 'Consulting Case Framework', difficulty: 'Intermediate' },
      { title: 'DCF Terminal Value & WACC Calculation', topic: 'Investment Banking Technicals', difficulty: 'Hard' },
    ]
  },
  MECH: {
    code: 'MECH',
    name: 'Mechanical & Mechatronics Engineering',
    degree: 'B.Tech',
    specializations: [
      'Thermal & Fluid Dynamics',
      'Computational Mechanics & FEA',
      'Robotics & Automated Manufacturing',
      'Aerospace Propulsion'
    ],
    defaultSubjects: [
      { code: 'ME-301', name: 'Applied Thermodynamics & Heat Transfer', credits: 4.0, instructor: 'Dr. P. Nair', room: 'Fluid Lab B' },
      { code: 'ME-302', name: 'Machine Design & Kinematics', credits: 4.0, instructor: 'Prof. C. Verma', room: 'Design Studio 1' },
      { code: 'ME-303', name: 'Finite Element Analysis (FEA)', credits: 3.5, instructor: 'Dr. G. Kulkarni', room: 'CAD/CAM Lab' },
      { code: 'ME-304', name: 'Manufacturing Processes & Metallurgy', credits: 3.5, instructor: 'Prof. D. Sen', room: 'Workshop 2' },
    ],
    careerRoadmap: {
      role: 'Thermal & Structural Simulation Engineer',
      targetCompanies: ['Tesla', 'SpaceX', 'General Electric', 'Boeing', 'Tata Motors'],
      keySkills: ['ANSYS FEA', 'SolidWorks CAD', 'Thermodynamics Cycle Analysis', 'GD&T Tolerancing'],
      atsTarget: 93,
    },
    sampleInterviews: [
      { title: 'Stress Concentration & Fatigue in Rotational Shafts', topic: 'Machine Design Principles', difficulty: 'Hard' },
      { title: 'Convective Heat Transfer in Microchannel Heat Sinks', topic: 'Thermodynamics & CFD', difficulty: 'Advanced' },
    ]
  },
  LAW: {
    code: 'LAW',
    name: 'Legal Studies & Jurisprudence',
    degree: 'B.A. LL.B (Hons)',
    specializations: [
      'Constitutional & Administrative Law',
      'Corporate & Securities Regulations',
      'Intellectual Property & Technology Law',
      'Criminal Law & Trial Advocacy'
    ],
    defaultSubjects: [
      { code: 'LAW-301', name: 'Constitutional Law of India II', credits: 4.0, instructor: 'Justice (Retd.) M. Rao', room: 'Moot Court Hall' },
      { code: 'LAW-302', name: 'Company Law & Corporate Governance', credits: 4.0, instructor: 'Dr. T. Aggarwal', room: 'Hall L-101' },
      { code: 'LAW-303', name: 'Law of Evidence & Trial Procedure', credits: 4.0, instructor: 'Prof. H. Joseph', room: 'Hall L-104' },
      { code: 'LAW-304', name: 'Intellectual Property Rights (IPR)', credits: 3.5, instructor: 'Dr. E. Trivedi', room: 'IPR Research Wing' },
    ],
    careerRoadmap: {
      role: 'Corporate Associate / Appellate Litigator',
      targetCompanies: ['Shardul Amarchand Mangaldas', 'AZB & Partners', 'Trilegal', 'Supreme Court of India'],
      keySkills: ['Contract Drafting', 'Statutory Interpretation', 'Moot Court Advocacy', 'Due Diligence'],
      atsTarget: 95,
    },
    sampleInterviews: [
      { title: 'Doctrine of Basic Structure & Judicial Review', topic: 'Constitutional Precedents', difficulty: 'Advanced' },
      { title: 'Mergers & Anti-Trust Review Case Study', topic: 'Competition Commission Jurisprudence', difficulty: 'Hard' },
    ]
  }
};

export function getStreamConfig(streamCode: string): StreamConfig {
  return STREAMS[streamCode.toUpperCase()] || STREAMS.CSE;
}
