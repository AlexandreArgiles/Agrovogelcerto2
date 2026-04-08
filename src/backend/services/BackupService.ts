import fs from 'fs';
import path from 'path';

type BackupTrigger = 'manual' | 'weekly-auto';

interface BackupMetadata {
  id: string;
  created_at: string;
  trigger: BackupTrigger;
  initiated_by: string;
  files: {
    database: boolean;
    uploads: boolean;
  };
}

export class BackupService {
  private backupRoot = path.join(process.cwd(), 'backups');
  private databasePath = path.join(process.cwd(), 'database.sqlite');
  private uploadsPath = path.join(process.cwd(), 'uploads');

  ensureBackupDir() {
    if (!fs.existsSync(this.backupRoot)) {
      fs.mkdirSync(this.backupRoot, { recursive: true });
    }
  }

  private buildBackupId(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  private getBackupDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  createBackup(trigger: BackupTrigger, initiatedBy = 'system') {
    this.ensureBackupDir();

    const backupId = this.buildBackupId();
    const targetDir = path.join(this.backupRoot, backupId);
    fs.mkdirSync(targetDir, { recursive: true });

    const hasDatabase = fs.existsSync(this.databasePath);
    const hasUploads = fs.existsSync(this.uploadsPath);

    if (hasDatabase) {
      fs.copyFileSync(this.databasePath, path.join(targetDir, 'database.sqlite'));
    }

    if (hasUploads) {
      fs.cpSync(this.uploadsPath, path.join(targetDir, 'uploads'), { recursive: true });
    }

    const metadata: BackupMetadata = {
      id: backupId,
      created_at: new Date().toISOString(),
      trigger,
      initiated_by: initiatedBy,
      files: {
        database: hasDatabase,
        uploads: hasUploads
      }
    };

    fs.writeFileSync(path.join(targetDir, 'metadata.json'), JSON.stringify(metadata, null, 2), 'utf-8');

    return {
      ...metadata,
      folder: `backups/${backupId}`
    };
  }

  listBackups() {
    this.ensureBackupDir();

    return fs.readdirSync(this.backupRoot, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => {
        const metadataPath = path.join(this.backupRoot, entry.name, 'metadata.json');
        if (!fs.existsSync(metadataPath)) {
          return {
            id: entry.name,
            created_at: null,
            trigger: 'manual',
            initiated_by: 'unknown',
            files: { database: false, uploads: false },
            folder: `backups/${entry.name}`
          };
        }

        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8')) as BackupMetadata;
        return {
          ...metadata,
          folder: `backups/${entry.name}`
        };
      })
      .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  }

  hasAutomaticBackupForDate(date = new Date()) {
    const targetDate = this.getBackupDateKey(date);
    return this.listBackups().some((backup) =>
      backup.trigger === 'weekly-auto' &&
      String(backup.created_at || '').startsWith(targetDate)
    );
  }

  runWeeklyBackupIfDue(date = new Date()) {
    const isFriday = date.getDay() === 5;
    if (!isFriday) return null;
    if (this.hasAutomaticBackupForDate(date)) return null;
    return this.createBackup('weekly-auto', 'system');
  }
}
