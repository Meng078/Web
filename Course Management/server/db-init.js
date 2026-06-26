/**
 * Database Initialization Script
 * 
 * Reads the SQL dump file, creates a SQLite database using sql.js,
 * and imports all data with bcrypt-hashed passwords.
 * 
 * Usage: node db-init.js
 */

const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Configuration
const DB_PATH = path.join(__dirname, 'course_management.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SQL_DUMP_PATH = path.join(
  'C:\\Users\\33508\\.trae-cn\\attachments\\6a3cbbc2bd689d14ca4566f1',
  '77697d93-710f-49b2-9890-bfffa1cace51_course_management.sql'
);

// Number of bcrypt hash rounds
const SALT_ROUNDS = 10;

/**
 * Strip surrounding single quotes from a value.
 * Removes the leading and trailing ' characters if present.
 */
function stripQuotes(val) {
  if (typeof val !== 'string') return val;
  let s = val.trim();
  if (s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1);
  }
  return s;
}

/**
 * Convert a MySQL hex string like _utf8mb4'...' or just 'value' to a clean value.
 */
function cleanValue(val) {
  if (typeof val !== 'string') return val;
  let s = val.trim();
  // Handle MySQL hex/encoding prefixes like _utf8mb4'value'
  // Just extract the quoted part
  const quoteMatch = s.match(/^_?[a-zA-Z0-9_]*'(.*)'\s*$/s);
  if (quoteMatch) {
    s = quoteMatch[1];
  } else if (s.startsWith("'") && s.endsWith("'")) {
    s = s.slice(1, -1);
  }
  return s;
}

/**
 * Parse a single tuple string like (1,'val','val2',...) into an array of values.
 * Handles commas inside single-quoted strings.
 */
function parseTuple(tupleStr) {
  const values = [];
  let current = '';
  let inQuotes = false;
  let escapeNext = false;

  for (let i = 0; i < tupleStr.length; i++) {
    const ch = tupleStr[i];

    if (escapeNext) {
      current += ch;
      escapeNext = false;
      continue;
    }

    if (ch === '\\') {
      current += ch;
      escapeNext = true;
      continue;
    }

    if (ch === "'") {
      inQuotes = !inQuotes;
      current += ch;
      continue;
    }

    if (ch === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += ch;
  }

  if (current.trim()) {
    values.push(current.trim());
  }

  // Clean each value: strip quotes and MySQL prefixes
  return values.map(v => cleanValue(v));
}

/**
 * Extract the VALUES portion from an INSERT statement.
 * Returns the content between the first '(' after VALUES and the last ')' before ';'.
 */
function extractValuesFromInsert(insertSql) {
  // Find the VALUES keyword
  const valuesMatch = insertSql.match(/VALUES\s*/i);
  if (!valuesMatch) return null;

  const valuesStart = valuesMatch.index + valuesMatch[0].length;
  const rest = insertSql.slice(valuesStart).trim();

  // Find the matching closing paren for the entire set of tuples
  // The content looks like: (1,'a','b'),(2,'c','d'),(3,'e','f');
  // We need to find all tuples

  let depth = 0;
  let tuplesStart = -1;
  let tuplesEnd = -1;
  const tuples = [];

  for (let i = 0; i < rest.length; i++) {
    const ch = rest[i];

    if (ch === '(') {
      if (depth === 0) {
        tuplesStart = i;
      }
      depth++;
    } else if (ch === ')') {
      depth--;
      if (depth === 0 && tuplesStart >= 0) {
        tuplesEnd = i;
        tuples.push(rest.slice(tuplesStart, tuplesEnd + 1));
        tuplesStart = -1;
      }
    }

    // Stop at semicolon if we're at depth 0
    if (ch === ';' && depth === 0 && tuples.length > 0) {
      break;
    }
  }

  return tuples;
}

/**
 * Parse course data from tuples and return arrays for SQLite insertion.
 */
function parseCourseTuples(tuples) {
  const courses = [];
  for (const tuple of tuples) {
    const vals = parseTuple(tuple);
    if (vals.length >= 11) {
      courses.push({
        id: parseInt(vals[0], 10),
        course_name: vals[1],
        teacher_name: vals[2],
        course_time: vals[3],
        course_location: vals[4],
        start_date: vals[5],
        end_date: vals[6],
        start_time: vals[7],
        end_time: vals[8],
        created_at: vals[9],
        updated_at: vals[10]
      });
    }
  }
  return courses;
}

/**
 * Parse user data from tuples, hash passwords, and return arrays for SQLite insertion.
 */
async function parseUserTuples(tuples) {
  const users = [];
  for (const tuple of tuples) {
    const vals = parseTuple(tuple);
    if (vals.length >= 7) {
      const plainPassword = vals[2];
      // Hash the password with bcrypt
      const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
      users.push({
        id: parseInt(vals[0], 10),
        username: vals[1],
        password: hashedPassword,
        name: vals[3],
        user_type: vals[4],
        created_at: vals[5],
        updated_at: vals[6]
      });
    }
  }
  return users;
}

/**
 * Main initialization function.
 */
async function initDatabase() {
  console.log('=== Course Management Database Initialization ===');
  console.log('');

  // Step 1: Read the schema SQL
  console.log('[1/5] Reading schema file...');
  const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  console.log(`  -> Schema loaded from: ${SCHEMA_PATH}`);

  // Step 2: Read the MySQL dump file
  console.log('[2/5] Reading MySQL dump file...');
  const dumpSql = fs.readFileSync(SQL_DUMP_PATH, 'utf-8');
  console.log(`  -> Dump loaded from: ${SQL_DUMP_PATH}`);

  // Step 3: Parse INSERT statements from the dump
  console.log('[3/5] Parsing INSERT statements...');

  // Extract INSERT INTO `courses` statement
  const coursesInsertMatch = dumpSql.match(/INSERT INTO\s+`courses`\s+VALUES[\s\S]*?;/i);
  let coursesTuples = [];
  let courses = [];
  if (coursesInsertMatch) {
    coursesTuples = extractValuesFromInsert(coursesInsertMatch[0]);
    courses = parseCourseTuples(coursesTuples);
    console.log(`  -> Parsed ${courses.length} course records`);
  } else {
    console.log('  -> WARNING: No courses INSERT found in dump file');
  }

  // Extract INSERT INTO `users` statement
  const usersInsertMatch = dumpSql.match(/INSERT INTO\s+`users`\s+VALUES[\s\S]*?;/i);
  let usersTuples = [];
  let users = [];
  if (usersInsertMatch) {
    usersTuples = extractValuesFromInsert(usersInsertMatch[0]);
    users = await parseUserTuples(usersTuples);
    console.log(`  -> Parsed ${users.length} user records (passwords hashed with bcrypt)`);
  } else {
    console.log('  -> WARNING: No users INSERT found in dump file');
  }

  // Step 4: Initialize SQLite database and create tables
  console.log('[4/5] Creating SQLite database...');
  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // Execute schema creation
  db.run(schemaSql);
  console.log('  -> Tables created: courses, users');
  console.log('  -> Indexes created');

  // Step 5: Insert data
  console.log('[5/5] Importing data...');

  // Insert courses
  const courseStmt = db.prepare(`
    INSERT INTO courses (id, course_name, teacher_name, course_time, course_location,
                         start_date, end_date, start_time, end_time, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const c of courses) {
    courseStmt.run([
      c.id, c.course_name, c.teacher_name, c.course_time, c.course_location,
      c.start_date, c.end_date, c.start_time, c.end_time, c.created_at, c.updated_at
    ]);
  }
  courseStmt.free();
  console.log(`  -> Inserted ${courses.length} courses`);

  // Insert users
  const userStmt = db.prepare(`
    INSERT INTO users (id, username, password, name, user_type, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const u of users) {
    userStmt.run([
      u.id, u.username, u.password, u.name, u.user_type, u.created_at, u.updated_at
    ]);
  }
  userStmt.free();
  console.log(`  -> Inserted ${users.length} users`);

  // Save the database to disk
  const dbData = db.export();
  const buffer = Buffer.from(dbData);
  fs.writeFileSync(DB_PATH, buffer);
  console.log('');
  console.log(`Database saved to: ${DB_PATH}`);
  console.log(`Database size: ${(buffer.length / 1024).toFixed(1)} KB`);

  // Close the database
  db.close();
  console.log('');
  console.log('=== Initialization Complete ===');

  return { coursesCount: courses.length, usersCount: users.length };
}

// Run the initialization
initDatabase()
  .then(result => {
    console.log(`Summary: ${result.coursesCount} courses, ${result.usersCount} users imported.`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Initialization failed:', err);
    process.exit(1);
  });
