const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/tuition-management').then(async () => {
  try {
    const db = mongoose.connection.db;
    const res = await db.collection('users').updateMany(
      { role: 'student' },
      { $set: { status: 'approved' } }
    );
    console.log(res);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
