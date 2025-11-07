import { DatabaseService } from '../config/database';

async function clearDatabase() {
  try {
    console.log('🗑️  Clearing database...\n');

    const db = DatabaseService.getInstance().getDatabase();

    // Get count before deletion
    const countBefore = db.prepare('SELECT COUNT(*) as count FROM resources').get() as { count: number };
    
    if (countBefore.count === 0) {
      console.log('ℹ️  Database is already empty.');
      DatabaseService.getInstance().close();
      process.exit(0);
      return;
    }

    // Delete all resources
    const result = db.prepare('DELETE FROM resources').run();

    console.log('✅ Database cleared successfully!');
    console.log(`   Deleted ${result.changes} resources\n`);

    DatabaseService.getInstance().close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to clear database:', error);
    process.exit(1);
  }
}

clearDatabase();
