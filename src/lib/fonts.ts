import { readFile } from 'fs/promises';
import { join } from 'path';

type FontData = {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: 'normal';
};

let cachedFonts: FontData[] | null = null;

export async function loadFonts(): Promise<FontData[]> {
  if (cachedFonts) return cachedFonts;

  const fontsDir = join(process.cwd(), 'public', 'fonts');

  const [delaGothic, golosRegular, golosBold] = await Promise.all([
    readFile(join(fontsDir, 'DelaGothicOne-Regular.ttf')),
    readFile(join(fontsDir, 'GolosText-Regular.ttf')),
    readFile(join(fontsDir, 'GolosText-Bold.ttf')),
  ]);

  cachedFonts = [
    { name: 'Dela Gothic One', data: delaGothic.buffer as ArrayBuffer, weight: 400, style: 'normal' },
    { name: 'Golos Text', data: golosRegular.buffer as ArrayBuffer, weight: 400, style: 'normal' },
    { name: 'Golos Text', data: golosBold.buffer as ArrayBuffer, weight: 700, style: 'normal' },
  ];

  return cachedFonts;
}
