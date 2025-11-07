import Database from 'better-sqlite3';
import path from 'path';

export class DatabaseService {
  private db: Database.Database;
  private static instance: DatabaseService;

  private constructor() {
    const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '../../database.sqlite');
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this.initialize();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private initialize(): void {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS resources (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createIndexSQL = `
      CREATE INDEX IF NOT EXISTS idx_category ON resources(category);
      CREATE INDEX IF NOT EXISTS idx_status ON resources(status);
      CREATE INDEX IF NOT EXISTS idx_name ON resources(name);
    `;

    this.db.exec(createTableSQL);
    this.db.exec(createIndexSQL);

    console.log('✅ Database initialized successfully');
  }

  public getDatabase(): Database.Database {
    return this.db;
  }

  public close(): void {
    this.db.close();
  }
}
