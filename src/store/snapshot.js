import fs from 'node:fs/promises';
import path from 'node:path';

export function createSnapshotStore(snapshotPath) {
  return {
    async load() {
      try {
        return JSON.parse(await fs.readFile(snapshotPath, 'utf8'));
      } catch (error) {
        if (error.code === 'ENOENT') return null;
        throw error;
      }
    },
    async save(snapshot) {
      await fs.mkdir(path.dirname(snapshotPath), { recursive: true });
      await fs.writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    },
  };
}
