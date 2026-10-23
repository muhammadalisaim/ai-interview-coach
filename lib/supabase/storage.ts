import fs from 'fs';
import path from 'path';
import os from 'os';
import { InterviewSession, Question, AnswerRecord, Role } from '../../types';
import { DEFAULT_ROLES } from '../roles';

// Multi-Tier In-Memory State for Serverless & Ephemeral Environments
interface MemoryStore {
  sessions: InterviewSession[];
  questions: Question[];
  answers: AnswerRecord[];
  roles: Role[];
}

const g = globalThis as unknown as { __interviewMemoryStore?: MemoryStore };
if (!g.__interviewMemoryStore) {
  g.__interviewMemoryStore = {
    sessions: [],
    questions: [],
    answers: [],
    roles: [...DEFAULT_ROLES],
  };
}
const memory = g.__interviewMemoryStore;

// Resolve safe writable directory (supports read-only serverless filesystems on Netlify/Vercel)
function resolveSafeDataDir(): string | null {
  // 1. Try local project directory
  try {
    const localDir = path.join(process.cwd(), '.data');
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    const testFile = path.join(localDir, '.probe');
    fs.writeFileSync(testFile, '1');
    fs.unlinkSync(testFile);
    return localDir;
  } catch {
    // 2. Try OS temp directory
    try {
      const tmpDir = path.join(os.tmpdir(), 'ai-interview-coach-data');
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      return tmpDir;
    } catch {
      return null;
    }
  }
}

const safeDataDir = resolveSafeDataDir();

function getFilePath(filename: string): string | null {
  if (!safeDataDir) return null;
  return path.join(safeDataDir, filename);
}

function readJsonFile<T>(filename: string, fallback: T): T {
  const filePath = getFilePath(filename);
  if (!filePath) return fallback;
  try {
    if (!fs.existsSync(filePath)) {
      return fallback;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonFile(filename: string, data: any) {
  const filePath = getFilePath(filename);
  if (!filePath) return;
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch {
    // Silently continue with in-memory store
  }
}

// In-Memory & Resilient Local Repository
export const localStore = {
  getSessions: (): InterviewSession[] => {
    if (memory.sessions.length > 0) return memory.sessions;
    const diskSessions = readJsonFile<InterviewSession[]>('sessions.json', []);
    if (diskSessions.length > 0) {
      memory.sessions = diskSessions;
    }
    return memory.sessions;
  },

  getSessionById: (id: string): InterviewSession | null => {
    const sessions = localStore.getSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  saveSession: (session: InterviewSession): InterviewSession => {
    const idx = memory.sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      memory.sessions[idx] = session;
    } else {
      memory.sessions.unshift(session);
    }
    writeJsonFile('sessions.json', memory.sessions);
    return session;
  },

  getQuestionsBySession: (sessionId: string): Question[] => {
    const allQuestions = memory.questions.length > 0
      ? memory.questions
      : readJsonFile<Question[]>('questions.json', []);
    memory.questions = allQuestions;
    return allQuestions
      .filter((q) => q.sessionId === sessionId)
      .sort((a, b) => a.position - b.position);
  },

  saveQuestion: (q: Question): Question => {
    memory.questions.push(q);
    writeJsonFile('questions.json', memory.questions);
    return q;
  },

  saveQuestions: (qs: Question[]) => {
    memory.questions.push(...qs);
    writeJsonFile('questions.json', memory.questions);
  },

  getAnswersBySession: (sessionId: string): AnswerRecord[] => {
    const allAnswers = memory.answers.length > 0
      ? memory.answers
      : readJsonFile<AnswerRecord[]>('answers.json', []);
    memory.answers = allAnswers;
    return allAnswers.filter((a) => a.sessionId === sessionId);
  },

  saveAnswer: (a: AnswerRecord): AnswerRecord => {
    memory.answers.push(a);
    writeJsonFile('answers.json', memory.answers);
    return a;
  },

  getRoles: (): Role[] => {
    if (memory.roles.length > 0 && memory.roles !== DEFAULT_ROLES) return memory.roles;
    const diskRoles = readJsonFile<Role[]>('roles.json', DEFAULT_ROLES);
    memory.roles = diskRoles;
    return memory.roles;
  },

  toggleRole: (roleId: string | number, active: boolean): Role[] => {
    const roles = localStore.getRoles();
    const updated = roles.map((r) =>
      String(r.id) === String(roleId) ? { ...r, active } : r
    );
    memory.roles = updated;
    writeJsonFile('roles.json', updated);
    return updated;
  },

  addRole: (newRole: Role): Role[] => {
    const roles = localStore.getRoles();
    roles.push(newRole);
    memory.roles = roles;
    writeJsonFile('roles.json', roles);
    return roles;
  },
};
