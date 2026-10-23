const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', '.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const sessionId1 = 'demo-session-frontend-01';
const sessionId2 = 'demo-session-fullstack-02';

const sessions = [
  {
    id: sessionId1,
    userId: 'default-user',
    role: 'Frontend Developer',
    level: 'fresher',
    questionCount: 5,
    status: 'finished',
    qualityScore: 8.5,
    confidenceScore: 8.8,
    englishScore: 8.5,
    overallScore: 86,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    finishedAt: new Date(Date.now() - 86400000 * 2 + 300000).toISOString(),
    report: {
      overallScore: 86,
      qualityScore: 8.5,
      confidenceScore: 8.8,
      englishScore: 8.5,
      verdict: 'Interview Ready',
      topStrengths: [
        'Demonstrated strong technical grasp of React state management and virtual DOM lifecycle',
        'Steady pacing averaging 138 WPM with clear pronunciation and natural delivery',
        'Structured answers well with clear project scenarios and problem-solving steps'
      ],
      topImprovements: [
        'Consistently conclude with tangible business results (e.g. reduced load time by 30%)',
        'Replace hesitation fillers like "basically" with deliberate silent pauses',
        'Use the STAR method explicitly for behavioral questions'
      ],
      sevenDayPlan: [
        { day: 'Day 1', title: '60-Second Elevator Pitch', task: 'Record yourself presenting your strongest portfolio project in under 60 seconds.' },
        { day: 'Day 2', title: 'STAR Behavioral Practice', task: 'Write down 3 challenging bugs you solved and structure them into STAR format.' },
        { day: 'Day 3', title: 'Filler Reduction Drill', task: 'Practice answering 3 questions while completely replacing "um" and "basically" with silent pauses.' },
        { day: 'Day 4', title: 'React Architecture Review', task: 'Review hooks dependencies, useMemo, useCallback, and Context API pitfalls.' },
        { day: 'Day 5', title: 'Action Verb Vocabulary', task: 'Practice using high-impact verbs: architected, refactored, optimized, benchmarked.' },
        { day: 'Day 6', title: 'Mock Retake Drill', task: 'Retake Question 3 and Question 4 in Practice Mode to raise their sub-scores above 9.0.' },
        { day: 'Day 7', title: 'Full Simulated Interview', task: 'Complete an 8-question mock interview in continuous voice mode.' }
      ],
      romanUrduSummary: 'Bohot zabardast interview raha! Aapki technical understanding aur English clarity bohot impressive hai. Bas STAR framework aur metrics pe thora mazeed focus karein.',
      answers: [
        {
          question: {
            id: 'q1',
            sessionId: sessionId1,
            text: 'Please introduce yourself and tell me why you chose frontend development.',
            position: 1,
            isFollowUp: false
          },
          answer: {
            id: 'a1',
            sessionId: sessionId1,
            questionId: 'q1',
            transcript: 'Hello, I am a fresh computer science graduate. I chose frontend development because I love turning complex logic into responsive, beautiful user experiences using React and TypeScript.',
            durationSec: 28,
            wpm: 135,
            fillerCount: 0,
            evaluation: {
              answer_quality: {
                score: 8.5,
                strengths: ['Concise and passionate introduction', 'Highlighted specific modern tech stack'],
                improvements: ['Mention one flagship project by name'],
                used_star: false
              },
              tone_score: 9,
              english: {
                score: 9,
                mistakes: [],
                vocabulary_tip: 'Strong articulation with clear sentence structure.'
              },
              better_answer: 'I am a computer science graduate specializing in modern frontend engineering. I build accessible, performant web applications using React, Next.js, and TypeScript, and recently developed a real-time collaborative workspace.',
              follow_up_question: null,
              roman_urdu_tip: 'Shandar intro! Agli dafa apne top project ka naam zaroor mention karein.'
            },
            createdAt: new Date().toISOString()
          }
        },
        {
          question: {
            id: 'q2',
            sessionId: sessionId1,
            text: 'How do you manage component state and avoid unnecessary re-renders in React?',
            position: 2,
            isFollowUp: false
          },
          answer: {
            id: 'a2',
            sessionId: sessionId1,
            questionId: 'q2',
            transcript: 'Basically, I keep state localized to where it is needed. For global state I prefer lightweight stores like Zustand. To prevent re-renders, you know, I use React memo and useCallback for stable function references.',
            durationSec: 36,
            wpm: 140,
            fillerCount: 2,
            evaluation: {
              answer_quality: {
                score: 8.5,
                strengths: ['Accurate architectural knowledge of React re-render optimization', 'Mentioned Zustand and memoization hooks'],
                improvements: ['Cut the opening "Basically" and "you know" filler words'],
                used_star: false
              },
              tone_score: 8,
              english: {
                score: 8.5,
                mistakes: [{ said: 'Basically I keep state', better: 'Primarily, I keep state' }],
                vocabulary_tip: 'Replace casual filler words with confident transitional adverbs.'
              },
              better_answer: 'I manage state hierarchically: keeping local component state isolated, and using Zustand or React Context for application-wide states. When profiling shows costly renders, I memoize child trees with React.memo and stabilize callbacks with useCallback.',
              follow_up_question: null,
              roman_urdu_tip: 'Concept bilkul clear tha, bas shuru ka "basically" avoid karein.'
            },
            createdAt: new Date().toISOString()
          }
        }
      ]
    }
  },
  {
    id: sessionId2,
    userId: 'default-user',
    role: 'Full Stack Developer',
    level: 'fresher',
    questionCount: 5,
    status: 'finished',
    qualityScore: 7.8,
    confidenceScore: 8.2,
    englishScore: 8.0,
    overallScore: 80,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    finishedAt: new Date(Date.now() - 86400000 * 1 + 320000).toISOString(),
    report: {
      overallScore: 80,
      qualityScore: 7.8,
      confidenceScore: 8.2,
      englishScore: 8.0,
      verdict: 'Good, Polish a Few Answers',
      topStrengths: [
        'Good breadth across frontend, database schemas, and REST APIs',
        'Confident vocal projection and steady response cadence'
      ],
      topImprovements: [
        'Elaborate more on database indexing and security measures',
        'Structure answers using STAR framework'
      ],
      sevenDayPlan: [],
      romanUrduSummary: 'Bohot acha interview tha, bas database optimization aur security ke sawalat pe mazeed practice karein.',
      answers: []
    }
  }
];

fs.writeFileSync(path.join(dataDir, 'sessions.json'), JSON.stringify(sessions, null, 2), 'utf-8');
console.log('Sample interview sessions seeded successfully.');
