const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tuition-management').then(async () => {
  try {
    const db = mongoose.connection.db;
    const result = await db.collection('users').updateMany(
      { teacherStatus: { $exists: true } },
      { $rename: { 'teacherStatus': 'status' } }
    );
    console.log('Migration successful:', result);
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
});
