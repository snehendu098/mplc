const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, 'prisma', 'dev.db');
console.log('Database path:', dbPath);

const db = new Database(dbPath);

const user = db.prepare('SELECT email, password FROM User WHERE email = ?').get('admin@srgg.com');

console.log('User:', user.email);
console.log('Hash from DB:', user.password);

const testPassword = 'Admin123!';
console.log('Testing password:', testPassword);

bcrypt.compare(testPassword, user.password).then(isValid => {
  console.log('Password match:', isValid);
  db.close();
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  db.close();
  process.exit(1);
});
