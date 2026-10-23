export const FILLERS = [
  'um',
  'umm',
  'uh',
  'er',
  'ah',
  'like',
  'you know',
  'basically',
  'actually',
  'i mean',
  'sort of',
  'kind of',
];

export const countWords = (t: string): number => {
  const clean = t.trim();
  return clean ? clean.split(/\s+/).length : 0;
};

export const wordsPerMinute = (t: string, sec: number): number => {
  if (sec <= 0) return 0;
  return Math.round(countWords(t) / (sec / 60));
};

export function countFillers(t: string): { total: number; detail: Record<string, number> } {
  const text = t.toLowerCase().replace(/[^a-z\s']/g, ' ');
  const detail: Record<string, number> = {};
  let total = 0;

  for (const f of FILLERS) {
    const regex = new RegExp(`\\b${f}\\b`, 'g');
    const matches = text.match(regex);
    const n = matches ? matches.length : 0;
    if (n > 0) {
      detail[f] = n;
      total += n;
    }
  }

  return { total, detail };
}

export interface HighlightSegment {
  text: string;
  isFiller: boolean;
}

/**
 * Tokenizes text and marks filler words/phrases for UI highlighting
 */
export function highlightFillersInText(text: string): HighlightSegment[] {
  if (!text) return [];

  // Sort fillers by length descending so multi-word like "you know" matches before "you"
  const sortedFillers = [...FILLERS].sort((a, b) => b.length - a.length);
  const pattern = new RegExp(`\\b(${sortedFillers.join('|')})\\b`, 'gi');

  const segments: HighlightSegment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    const startIndex = match.index;
    if (startIndex > lastIndex) {
      segments.push({
        text: text.slice(lastIndex, startIndex),
        isFiller: false,
      });
    }
    segments.push({
      text: match[0],
      isFiller: true,
    });
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({
      text: text.slice(lastIndex),
      isFiller: false,
    });
  }

  return segments;
}
