const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('./config');

async function main() {
  console.log('Connecting to MySQL...');
  const pool = mysql.createPool(config);
  const [rows] = await pool.execute('SELECT id, username, password FROM users');
  console.log('Users found:', rows.length);

  let updated = 0;
  for (const user of rows) {
    if (user.password.startsWith('$2')) {
      console.log('  SKIP ' + user.username + ' (already hashed)');
      continue;
    }
    const hashed = await bcrypt.hash(user.password, 10);
    await pool.execute('UPDATE users SET password = ? WHERE id = ?', [hashed, user.id]);
    console.log('  OK   ' + user.username + ' -> password hashed');
    updated++;
  }

  await pool.end();
  console.log('\nDone! ' + updated + ' passwords hashed.');
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
