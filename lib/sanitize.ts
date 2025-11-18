import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window;
const purify = DOMPurify(window as any);

export function sanitize(dirty: string | null | undefined): string | null {
  if (!dirty) {
    return null;
  }
  const cleaned = purify.sanitize(dirty);
  return cleaned || null;
}
