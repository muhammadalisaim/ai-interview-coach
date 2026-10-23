import fs from 'fs';
import path from 'path';
import { InterviewSession, Question, AnswerRecord, Role } from '../../types';
import { DEFAULT_ROLES } from '../roles';

const DATA_DIR = path.join(process.cwd(), '.data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const QUESTIONS_FILE = path.join(DATA_DIR, 'questions.json');
const ANSWERS_FILE = path.join(DATA_DIR, 'answers.json');
const ROLES_FILE = path.join(DATA_DIR, 'roles.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2), 'utf-8');
    return fallback;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJsonFile(filePath: string, data: any) {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

// In-Memory & File-Backed Local Repository
export const localStore = {
  getSessions: (): InterviewSession[] => {
    return readJsonFile<InterviewSession[]>(SESSIONS_FILE, []);
  },

  getSessionById: (id: string): InterviewSession | null => {
    const sessions = localStore.getSessions();
    return sessions.find((s) => s.id === id) || null;
  },

  saveSession: (session: InterviewSession): InterviewSession => {
    const sessions = localStore.getSessions();
    const idx = sessions.findIndex((s) => s.id === session.id);
    if (idx >= 0) {
      sessions[idx] = session;
    } else {
      sessions.unshift(session);
    }
    writeJsonFile(SESSIONS_FILE, sessions);
    return session;
  },

  getQuestionsBySession: (sessionId: string): Question[] => {
    const questions = readJsonFile<Question[]>(QUESTIONS_FILE, []);
    return questions
      .filter((q) => q.sessionId === sessionId)
      .sort((a, b) => a.position - b.position);
  },

  saveQuestion: (q: Question): Question => {
    const questions = readJsonFile<Question[]>(QUESTIONS_FILE, []);
    questions.push(q);
    writeJsonFile(QUESTIONS_FILE, questions);
    return q;
  },

  saveQuestions: (qs: Question[]) => {
    const questions = readJsonFile<Question[]>(QUESTIONS_FILE, []);
    questions.push(...qs);
    writeJsonFile(QUESTIONS_FILE, questions);
  },

  getAnswersBySession: (sessionId: string): AnswerRecord[] => {
    const answers = readJsonFile<AnswerRecord[]>(ANSWERS_FILE, []);
    return answers.filter((a) => a.sessionId === sessionId);
  },

  saveAnswer: (a: AnswerRecord): AnswerRecord => {
    const answers = readJsonFile<AnswerRecord[]>(ANSWERS_FILE, []);
    answers.push(a);
    writeJsonFile(ANSWERS_FILE, answers);
    return a;
  },

  getRoles: (): Role[] => {
    return readJsonFile<Role[]>(ROLES_FILE, DEFAULT_ROLES);
  },

  toggleRole: (roleId: string | number, active: boolean): Role[] => {
    const roles = localStore.getRoles();
    const updated = roles.map((r) =>
      String(r.id) === String(roleId) ? { ...r, active } : r
    );
    writeJsonFile(ROLES_FILE, updated);
    return updated;
  },

  addRole: (newRole: Role): Role[] => {
    const roles = localStore.getRoles();
    roles.push(newRole);
    writeJsonFile(ROLES_FILE, roles);
    return roles;
  },
};
