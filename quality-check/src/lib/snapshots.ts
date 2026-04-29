import fs from 'fs/promises';
import path from 'path';
import type { Snapshot } from './types';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

// ─── helpers de data ───────────────────────────────────────────────────────

/** "2025-04" */
export function currentMonth(date: Date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

/** Qual semana do mês: dia 1-7 = 1, 8-14 = 2, 15-21 = 3, 22-28 = 4, 29+ = 5 */
export function weekOfMonth(date: Date = new Date()): number {
  return Math.ceil(date.getDate() / 7);
}

/** "2025-04-semana-02" — ID único do arquivo */
export function weekFileId(date: Date = new Date()): string {
  const m = currentMonth(date);
  const w = String(weekOfMonth(date)).padStart(2, '0');
  return `${m}-semana-${w}`;
}

/** "Semana 2 · Abril 2025" */
export function weekLabel(date: Date = new Date()): string {
  const w = weekOfMonth(date);
  const mes = MESES[date.getMonth()];
  return `Semana ${w} · ${mes} ${date.getFullYear()}`;
}

/** "Abril 2025" a partir de "2025-04" */
export function monthLabel(month: string): string {
  const [year, m] = month.split('-');
  return `${MESES[parseInt(m, 10) - 1]} ${year}`;
}

// ─── caminhos ──────────────────────────────────────────────────────────────

function baseDir(): string {
  return process.env.SNAPSHOTS_DIR ?? path.join(process.cwd(), 'data', 'snapshots');
}

async function monthDirPath(month: string): Promise<string> {
  const dir = path.join(baseDir(), month);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function filePath(month: string, id: string): Promise<string> {
  const fileName = id.replace(`${month}-`, '') + '.json';
  return path.join(await monthDirPath(month), fileName);
}

async function pathExists(p: string): Promise<boolean> {
  try { await fs.access(p); return true; } catch { return false; }
}

async function findById(id: string): Promise<string | null> {
  const match = id.match(/^(\d{4}-\d{2})-/);
  if (match) {
    const fileName = id.replace(`${match[1]}-`, '') + '.json';
    const candidate = path.join(baseDir(), match[1], fileName);
    if (await pathExists(candidate)) return candidate;
  }
  // fallback: varre todas as pastas
  const base = baseDir();
  let entries: string[];
  try { entries = await fs.readdir(base); } catch { return null; }
  for (const entry of entries) {
    const candidate = path.join(base, entry, id.replace(/^\d{4}-\d{2}-/, '') + '.json');
    if (await pathExists(candidate)) return candidate;
  }
  return null;
}

// ─── API pública ───────────────────────────────────────────────────────────

export async function listSnapshots(): Promise<Omit<Snapshot, 'gps'>[]> {
  const base = baseDir();
  const result: Omit<Snapshot, 'gps'>[] = [];

  let entries: string[];
  try { entries = await fs.readdir(base); } catch { return result; }

  await Promise.all(
    entries
      .filter((e) => /^\d{4}-\d{2}$/.test(e))
      .map(async (entry) => {
        const entryPath = path.join(base, entry);
        try {
          const stat = await fs.stat(entryPath);
          if (!stat.isDirectory()) return;
          const files = (await fs.readdir(entryPath)).filter((x) => x.endsWith('.json'));
          await Promise.all(
            files.map(async (f) => {
              try {
                const raw = await fs.readFile(path.join(entryPath, f), 'utf-8');
                const s: Snapshot = JSON.parse(raw);
                result.push({ id: s.id, month: s.month, weekOfMonth: s.weekOfMonth, label: s.label, createdAt: s.createdAt });
              } catch { /* ignora arquivo corrompido */ }
            })
          );
        } catch { /* ignora entrada inválida */ }
      })
  );

  return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function loadSnapshot(id: string): Promise<Snapshot | null> {
  const fp = await findById(id);
  if (!fp) return null;
  try {
    return JSON.parse(await fs.readFile(fp, 'utf-8')) as Snapshot;
  } catch {
    return null;
  }
}

export async function saveSnapshot(snapshot: Snapshot): Promise<void> {
  const fp = await filePath(snapshot.month, snapshot.id);
  await fs.writeFile(fp, JSON.stringify(snapshot, null, 2), 'utf-8');
}
