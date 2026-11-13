export {PAGES} from '../src/overlay/Karaoke';
import {PAGES} from '../src/overlay/Karaoke';
export const pages = PAGES.map((p) => p.words.map((w) => w.w).join(' '));
