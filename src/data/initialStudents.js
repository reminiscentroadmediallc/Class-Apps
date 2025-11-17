// Initial student data with period mapping
// 7C = 1st Period, 7D = 3rd Period, 7E = 4th Period, 7A = 8th Period, 7B = 9th Period

export const PERIOD_MAPPING = {
  '7C': { period: 1, name: '1st Period' },
  '7D': { period: 3, name: '3rd Period' },
  '7E': { period: 4, name: '4th Period' },
  '7A': { period: 8, name: '8th Period' },
  '7B': { period: 9, name: '9th Period' }
};

export const ROLES = [
  'Lead Researcher',
  'Script Writer',
  'Director / Visual Designer',
  'On-Camera Ambassador'
];

export const ROLE_QUESTIONS = {
  'Lead Researcher': [
    { id: 'lr1', text: 'How thoroughly did they research the topic?', maxScore: 5 },
    { id: 'lr2', text: 'Did they organize information effectively?', maxScore: 5 },
    { id: 'lr3', text: 'How well did they share research findings with the team?', maxScore: 5 },
    { id: 'lr4', text: 'Did they verify sources and ensure accuracy?', maxScore: 5 }
  ],
  'Script Writer': [
    { id: 'sw1', text: 'How clear and well-structured was the script?', maxScore: 5 },
    { id: 'sw2', text: 'Did they incorporate team input effectively?', maxScore: 5 },
    { id: 'sw3', text: 'Was the content engaging and appropriate for the audience?', maxScore: 5 },
    { id: 'sw4', text: 'How well did they meet deadlines for script drafts?', maxScore: 5 }
  ],
  'Director / Visual Designer': [
    { id: 'dv1', text: 'How creative and effective were the visual elements?', maxScore: 5 },
    { id: 'dv2', text: 'Did they guide the team with a clear vision?', maxScore: 5 },
    { id: 'dv3', text: 'How well did they coordinate the production process?', maxScore: 5 },
    { id: 'dv4', text: 'Were the final visuals professional and polished?', maxScore: 5 }
  ],
  'On-Camera Ambassador': [
    { id: 'oc1', text: 'How confident and clear was their presentation?', maxScore: 5 },
    { id: 'oc2', text: 'Did they represent the team\'s work effectively?', maxScore: 5 },
    { id: 'oc3', text: 'How well did they engage with the audience?', maxScore: 5 },
    { id: 'oc4', text: 'Were they well-prepared and professional?', maxScore: 5 }
  ]
};

// Peer Evaluation Questions (aligned with official form)
export const PEER_EVAL_QUESTIONS = [
  { id: 'contribution', text: 'Contribution: Did they do their fair share of the work?', maxScore: 5 },
  { id: 'reliability', text: 'Reliability: Did they complete their assigned role and tasks on time?', maxScore: 5 },
  { id: 'attitude', text: 'Attitude: Were they positive, collaborative, and focused?', maxScore: 5 }
];

// Self-Evaluation Questions
export const SELF_EVAL_QUESTIONS = [
  { id: 'day1', text: 'I actively participated in research and discussion on Day 1.', maxScore: 5, needsExplanation: true },
  { id: 'day2', text: 'I contributed significantly to the script and/or visual design on Day 2.', maxScore: 5, needsExplanation: true },
  { id: 'day3', text: 'I was focused and helpful during the recording and submission process on Day 3.', maxScore: 5, needsExplanation: true }
];

export const GENERAL_QUESTIONS = [
  { id: 'g1', text: 'How well did this team member collaborate with others?', maxScore: 5 },
  { id: 'g2', text: 'Did they contribute their fair share to the project?', maxScore: 5 },
  { id: 'g3', text: 'How effectively did they communicate with the team?', maxScore: 5 }
];

export const initialStudents = [
  { firstName: 'LYLANA', lastName: 'A', homeroom: '7D' },
  { firstName: 'LAURA', lastName: 'A', homeroom: '7C' },
  { firstName: 'SEBASTIAN', lastName: 'A', homeroom: '7A' },
  { firstName: 'AZMERA', lastName: 'A', homeroom: '7E' },
  { firstName: 'ESMERALDA', lastName: 'A', homeroom: '7B' },
  { firstName: 'GABRIELA', lastName: 'A', homeroom: '7B' },
  { firstName: 'ISABELLA', lastName: 'B', homeroom: '7E' },
  { firstName: 'ADRIAN', lastName: 'B', homeroom: '7C' },
  { firstName: 'JOSUE', lastName: 'B', homeroom: '7D' },
  { firstName: 'KENYA', lastName: 'B', homeroom: '7D' },
  { firstName: 'GAREK', lastName: 'C', homeroom: '7B' },
  { firstName: 'SOPHIA', lastName: 'C', homeroom: '7E' },
  { firstName: 'ROMEO', lastName: 'C', homeroom: '7A' },
  { firstName: 'ANTHONY', lastName: 'C', homeroom: '7A' },
  { firstName: 'DIAMOND', lastName: 'C', homeroom: '7E' },
  { firstName: 'RYAN', lastName: 'C', homeroom: '7A' },
  { firstName: 'LORELY', lastName: 'C', homeroom: '7A' },
  { firstName: 'RAYMOND', lastName: 'C', homeroom: '7C' },
  { firstName: 'ISABELLA', lastName: 'C', homeroom: '7D' },
  { firstName: 'GIANA', lastName: 'C', homeroom: '7C' },
  { firstName: 'RAFAEL', lastName: 'C', homeroom: '7C' },
  { firstName: 'LANDON', lastName: 'D', homeroom: '7C' },
  { firstName: 'NATHAN', lastName: 'D', homeroom: '7E' },
  { firstName: 'EMILY', lastName: 'D', homeroom: '7D' },
  { firstName: 'GABRIELA', lastName: 'E', homeroom: '7C' },
  { firstName: 'KYRA', lastName: 'F', homeroom: '7B' },
  { firstName: 'PEDRO', lastName: 'F', homeroom: '7A' },
  { firstName: 'ETHAN', lastName: 'G', homeroom: '7B' },
  { firstName: 'CHRISTIAN', lastName: 'G', homeroom: '7E' },
  { firstName: 'ISAAC', lastName: 'G', homeroom: '7B' },
  { firstName: 'ISABELLE', lastName: 'G', homeroom: '7B' },
  { firstName: 'ISABELLA', lastName: 'G', homeroom: '7E' },
  { firstName: 'WILLIAM', lastName: 'G', homeroom: '7B' },
  { firstName: 'LESLIE', lastName: 'G', homeroom: '7D' },
  { firstName: 'ARABELA', lastName: 'G', homeroom: '7B' },
  { firstName: 'LAURA', lastName: 'G', homeroom: '7C' },
  { firstName: 'PAXTON', lastName: 'G', homeroom: '7A' },
  { firstName: 'CHRISTOPHER', lastName: 'G', homeroom: '7D' },
  { firstName: 'CHARLIE', lastName: 'H', homeroom: '7A' },
  { firstName: 'AVA', lastName: 'H', homeroom: '7E' },
  { firstName: 'CARLISLE', lastName: 'H', homeroom: '7C' },
  { firstName: 'ETIDO', lastName: 'I', homeroom: '7B' },
  { firstName: 'GIOVANNI', lastName: 'L', homeroom: '7C' },
  { firstName: 'ALEENA', lastName: 'L', homeroom: '7D' },
  { firstName: 'NAOMI', lastName: 'L', homeroom: '7E' },
  { firstName: 'PATRICIA', lastName: 'L', homeroom: '7A' },
  { firstName: 'VALENTINA', lastName: 'L', homeroom: '7D' },
  { firstName: 'LOLA', lastName: 'L', homeroom: '7A' },
  { firstName: 'ISAIAH', lastName: 'L', homeroom: '7A' },
  { firstName: 'ISAAC', lastName: 'L', homeroom: '7B' },
  { firstName: 'LOGAN', lastName: 'L', homeroom: '7E' },
  { firstName: 'KAREN', lastName: 'L', homeroom: '7E' },
  { firstName: 'AIDEN', lastName: 'M', homeroom: '7C' },
  { firstName: 'MELANIE', lastName: 'M', homeroom: '7D' },
  { firstName: 'ANALYCIA', lastName: 'M', homeroom: '7D' },
  { firstName: 'CECILIA', lastName: 'M', homeroom: '7D' },
  { firstName: 'BELLA', lastName: 'M', homeroom: '7C' },
  { firstName: 'YULEINY', lastName: 'M', homeroom: '7A' },
  { firstName: 'ORLANDO', lastName: 'M', homeroom: '7B' },
  { firstName: 'LEVI', lastName: 'N', homeroom: '7E' },
  { firstName: 'ADAEZE', lastName: 'O', homeroom: '7C' },
  { firstName: 'ARIANNA', lastName: 'O', homeroom: '7E' },
  { firstName: 'JULISSA', lastName: 'O', homeroom: '7B' },
  { firstName: 'MOISES', lastName: 'O', homeroom: '7E' },
  { firstName: 'ISMERAI', lastName: 'O', homeroom: '7A' },
  { firstName: 'ISARELI', lastName: 'O', homeroom: '7C' },
  { firstName: 'IKER', lastName: 'P', homeroom: '7A' },
  { firstName: 'JEREMY', lastName: 'P', homeroom: '7E' },
  { firstName: 'TOKY', lastName: 'P', homeroom: '7C' },
  { firstName: 'ETHAN', lastName: 'P', homeroom: '' },
  { firstName: 'LENA', lastName: 'P', homeroom: '7D' },
  { firstName: 'JOEL', lastName: 'P', homeroom: '7C' },
  { firstName: 'SAMUEL', lastName: 'P', homeroom: '7E' },
  { firstName: 'ALLISON', lastName: 'P', homeroom: '7C' },
  { firstName: 'XZAVIER', lastName: 'P', homeroom: '7D' },
  { firstName: 'MAKAI', lastName: 'R', homeroom: '7E' },
  { firstName: 'GABRIELA', lastName: 'R', homeroom: '7C' },
  { firstName: 'SCARLETT', lastName: 'R', homeroom: '7B' },
  { firstName: 'AIDEN', lastName: 'R', homeroom: '7B' },
  { firstName: 'AHLINA', lastName: 'R', homeroom: '7A' },
  { firstName: 'JASON', lastName: 'R', homeroom: '7D' },
  { firstName: 'EVELYN', lastName: 'R', homeroom: '7E' },
  { firstName: 'ISAAC', lastName: 'R', homeroom: '7B' },
  { firstName: 'MATEO', lastName: 'R', homeroom: '7A' },
  { firstName: 'ARIAN', lastName: 'R', homeroom: '7D' },
  { firstName: 'ELLA', lastName: 'R', homeroom: '7C' },
  { firstName: 'CHASE', lastName: 'R', homeroom: '7A' },
  { firstName: 'JORGE', lastName: 'R', homeroom: '7B' },
  { firstName: 'ADRIAN', lastName: 'R', homeroom: '7D' },
  { firstName: 'CAYLA', lastName: 'S', homeroom: '7D' },
  { firstName: 'RAIDEN', lastName: 'S', homeroom: '7D' },
  { firstName: 'LEILYNN', lastName: 'S', homeroom: '7D' },
  { firstName: 'ABIGAIL', lastName: 'S', homeroom: '7C' },
  { firstName: 'JAMARI', lastName: 'S', homeroom: '7C' },
  { firstName: 'ARDYN', lastName: 'S', homeroom: '7B' },
  { firstName: 'YAHYA', lastName: 'S', homeroom: '7E' },
  { firstName: 'MATTHEW', lastName: 'T', homeroom: '7A' },
  { firstName: 'STEPHANIE', lastName: 'T', homeroom: '7C' },
  { firstName: 'JONATHAN', lastName: 'T', homeroom: '7C' },
  { firstName: 'VICTOR', lastName: 'V', homeroom: '7A' },
  { firstName: 'AUDREY', lastName: 'V', homeroom: '7D' },
  { firstName: 'VALERIA', lastName: 'V', homeroom: '7A' },
  { firstName: 'DETZIREE', lastName: 'V', homeroom: '7A' },
  { firstName: 'ALEXANDER', lastName: 'V', homeroom: '7E' },
  { firstName: 'PERLA', lastName: 'V', homeroom: '7C' },
  { firstName: 'PEIGHTON', lastName: 'W', homeroom: '7E' },
  { firstName: 'ROBERTO', lastName: 'W', homeroom: '7B' },
  { firstName: 'BROCK', lastName: 'W', homeroom: '7A' }
];
