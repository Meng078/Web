/**
 * Course Management Server
 *
 * Express 服务器，提供课程管理的 REST API。
 * 使用 MySQL（mysql2/promise 连接池）进行数据持久化。
 *
 * 基础 URL: http://localhost:3001
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { getPool, closePool } = require('./db');
const { getCachedCourses, setCachedCourses, invalidateCourseCache } = require('./course-cache');

const app = express();
const PORT = process.env.PORT || 3001;

// --------------- Middleware ---------------

// 启用 CORS
app.use(cors());

// 解析 JSON 请求体
app.use(express.json());

// --------------- Health Check ---------------
// ★ 放在 DB 中间件之前，确保健康检查始终快速返回 ★

/**
 * GET /api/health
 * 健康检查端点
 */
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running (MySQL)',
    timestamp: new Date().toISOString()
  });
});

/**
 * 中间件：将 MySQL 连接池附加到每个请求
 */
app.use(async (req, res, next) => {
  try {
    req.db = await getPool();
    next();
  } catch (err) {
    console.error('[server] 数据库连接池初始化失败:', err.message);
    res.status(500).json({
      success: false,
      message: '数据库连接失败，请确认 MySQL 服务已启动'
    });
  }
});

// =================== 辅助函数 ===================

/**
 * 从 course_time 解析 weekday 和 time_range
 * 例如: "周三 08:00-09:40" → { weekday: "周三", time_range: "08:00-09:40" }
 */
function parseCourseTime(courseTime) {
  if (!courseTime) return { weekday: null, time_range: null };
  
  // 尝试匹配 "周X HH:MM-HH:MM" 格式
  const match = courseTime.match(/^(周[一二三四五六日])\s+(\d{2}:\d{2}-\d{2}:\d{2})$/);
  if (match) {
    return { weekday: match[1], time_range: match[2] };
  }
  
  // 尝试匹配 "周X HH:MM~HH:MM" 格式
  const match2 = courseTime.match(/^(周[一二三四五六日])\s+(\d{2}:\d{2}~\d{2}:\d{2})$/);
  if (match2) {
    return { weekday: match2[1], time_range: match2[2].replace('~', '-') };
  }
  
  return { weekday: null, time_range: null };
}

// =================== Auth Routes ===================

/**
 * POST /api/login
 * 用户登录认证
 * Body: { username, password }
 */
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
    }

    const [rows] = await req.db.execute(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const user = rows[0];

    // 验证 bcrypt 密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        name: user.name,
        user_type: user.user_type
      }
    });
  } catch (err) {
    console.error('[login] 错误:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * POST /api/register
 * 用户注册
 * Body: { username, password, name, user_type }
 */
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, name, user_type } = req.body;

    if (!username || !password || !name) {
      return res.status(400).json({
        success: false,
        message: '用户名、密码和姓名不能为空'
      });
    }

    const validTypes = ['teacher', 'student'];
    const userType = user_type && validTypes.includes(user_type) ? user_type : 'student';

    // 检查用户名是否已存在
    const [existing] = await req.db.execute(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 使用 bcrypt 哈希密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 插入新用户
    const [result] = await req.db.execute(
      'INSERT INTO users (username, password, name, user_type) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, name, userType]
    );

    // 查询刚创建的用户
    const [newUserRows] = await req.db.execute(
      'SELECT id, username, name, user_type FROM users WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newUserRows[0]
    });
  } catch (err) {
    console.error('[register] 错误:', err.message);

    // 处理 MySQL 唯一索引冲突
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: '用户名已存在'
      });
    }

    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// =================== Courses Routes ===================

/**
 * GET /api/courses
 * 获取所有课程（带服务端内存缓存，亚毫秒级响应）
 */
app.get('/api/courses', async (req, res) => {
  try {
    // ★ 优先从内存缓存返回，完全跳过 MySQL 查询 ★
    const cached = getCachedCourses();
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        fromCache: true
      });
    }

    // 缓存不存在或已过期，查询 MySQL
    const [rows] = await req.db.execute('SELECT * FROM courses ORDER BY id');

    // ★ 缓存结果供下次请求直接使用 ★
    setCachedCourses(rows);

    return res.json({
      success: true,
      data: rows,
      fromCache: false
    });
  } catch (err) {
    console.error('[get courses] 错误:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * GET /api/courses/:id
 * 根据 ID 获取单个课程
 */
app.get('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程 ID'
      });
    }

    const [rows] = await req.db.execute(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('[get course] 错误:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * POST /api/courses
 * 添加新课程
 * Body: { course_name, teacher_name, course_time, course_location, start_date, end_date, start_time, end_time }
 */
app.post('/api/courses', async (req, res) => {
  try {
    const {
      course_name, teacher_name, course_time, course_location,
      start_date, end_date, start_time, end_time
    } = req.body;

    if (!course_name || !teacher_name) {
      return res.status(400).json({
        success: false,
        message: '课程名称和教师姓名不能为空'
      });
    }

    // 从 course_time 解析 weekday 和 time_range
    const { weekday, time_range } = parseCourseTime(course_time);

    const [result] = await req.db.execute(
      `INSERT INTO courses (course_name, teacher_name, course_time, course_location,
                            weekday, time_range, start_date, end_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_name, teacher_name, course_time || null, course_location || null,
        weekday, time_range,
        start_date || null, end_date || null, start_time || null, end_time || null
      ]
    );

    // ★ 清除缓存，使新课程能被下次 GET 查询到 ★
    invalidateCourseCache();

    // 查询刚创建的课程
    const [newRows] = await req.db.execute(
      'SELECT * FROM courses WHERE id = ?',
      [result.insertId]
    );

    return res.status(201).json({
      success: true,
      data: newRows[0]
    });
  } catch (err) {
    console.error('[create course] 错误:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * PUT /api/courses/:id
 * 更新课程
 * Body: 任何课程字段的子集
 */
app.put('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程 ID'
      });
    }

    // 检查课程是否存在
    const [existing] = await req.db.execute(
      'SELECT id FROM courses WHERE id = ?',
      [courseId]
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    const {
      course_name, teacher_name, course_time, course_location,
      start_date, end_date, start_time, end_time
    } = req.body;

    // 构建动态 UPDATE 语句
    const updateFields = [];
    const updateValues = [];

    if (course_name !== undefined) {
      updateFields.push('course_name = ?');
      updateValues.push(course_name);
    }
    if (teacher_name !== undefined) {
      updateFields.push('teacher_name = ?');
      updateValues.push(teacher_name);
    }
    if (course_time !== undefined) {
      updateFields.push('course_time = ?');
      updateValues.push(course_time);
      // 同时更新解析后的 weekday 和 time_range
      const { weekday, time_range } = parseCourseTime(course_time);
      updateFields.push('weekday = ?');
      updateValues.push(weekday);
      updateFields.push('time_range = ?');
      updateValues.push(time_range);
    }
    if (course_location !== undefined) {
      updateFields.push('course_location = ?');
      updateValues.push(course_location);
    }
    if (start_date !== undefined) {
      updateFields.push('start_date = ?');
      updateValues.push(start_date);
    }
    if (end_date !== undefined) {
      updateFields.push('end_date = ?');
      updateValues.push(end_date);
    }
    if (start_time !== undefined) {
      updateFields.push('start_time = ?');
      updateValues.push(start_time);
    }
    if (end_time !== undefined) {
      updateFields.push('end_time = ?');
      updateValues.push(end_time);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: '没有提供要更新的字段'
      });
    }

    updateValues.push(courseId);

    await req.db.execute(
      `UPDATE courses SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // ★ 清除缓存，使更新后的课程能被下次 GET 查询到 ★
    invalidateCourseCache();

    // 查询更新后的课程
    const [updatedRows] = await req.db.execute(
      'SELECT * FROM courses WHERE id = ?',
      [courseId]
    );

    return res.json({
      success: true,
      data: updatedRows[0]
    });
  } catch (err) {
    console.error('[update course] 错误:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * DELETE /api/courses/:id
 * 删除课程
 */
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);

    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: '无效的课程 ID'
      });
    }

    // 检查课程是否存在
    const [existing] = await req.db.execute(
      'SELECT id FROM courses WHERE id = ?',
      [courseId]
    );
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: '课程不存在'
      });
    }

    await req.db.execute(
      'DELETE FROM courses WHERE id = ?',
      [courseId]
    );

    // ★ 清除缓存，使删除操作能被下次 GET 查询到 ★
    invalidateCourseCache();

    return res.json({
      success: true,
      message: '课程已成功删除'
    });
  } catch (err) {
    console.error('[delete course] 错误:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// =================== Users Routes ===================

/**
 * GET /api/users
 * 获取所有用户（不返回密码字段）
 */
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await req.db.execute(
      'SELECT id, username, name, user_type, created_at, updated_at FROM users ORDER BY id'
    );
    return res.json({
      success: true,
      data: rows
    });
  } catch (err) {
    console.error('[get users] 错误:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

/**
 * GET /api/users/:id
 * 根据 ID 获取单个用户（不返回密码字段）
 */
app.get('/api/users/:id', async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: '无效的用户 ID'
      });
    }

    const [rows] = await req.db.execute(
      'SELECT id, username, name, user_type, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error('[get user] 错误:', err.message);
    return res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
});

// --------------- 数据库自动初始化（云端首次部署时自动建表） ---------------

async function ensureDatabase() {
  const isCloud = process.env.DATABASE_URL || process.env.MYSQL_HOST;
  if (!isCloud) return; // 本地开发不自动执行

  try {
    const pool = await getPool();
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) return;

    const sql = fs.readFileSync(schemaPath, 'utf8');
    // 执行建表语句和种子数据插入语句
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && (
        /^CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS/i.test(s) ||
        /^INSERT\s+IGNORE\s+INTO/i.test(s)
      ));

    for (const stmt of statements) {
      try {
        await pool.execute(stmt);
      } catch (err) {
        console.warn('[init] 执行SQL警告:', err.message);
      }
    }
    console.log('[init] ✅ 数据库表结构及种子数据已确认');
  } catch (err) {
    console.warn('[init] 数据库初始化跳过:', err.message);
  }
}

/**
 * POST /api/init-db
 * 手动触发数据库初始化（导入种子数据）
 * 仅云端环境可用，用于首次部署后手动补入数据
 */
app.post('/api/init-db', async (req, res) => {
  try {
    const pool = await getPool();
    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      return res.status(404).json({ success: false, message: 'schema.sql 文件不存在' });
    }

    const sql = fs.readFileSync(schemaPath, 'utf8');
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s && (
        /^CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS/i.test(s) ||
        /^INSERT\s+IGNORE\s+INTO/i.test(s)
      ));

    let executed = 0;
    let errors = [];

    for (const stmt of statements) {
      try {
        await pool.execute(stmt);
        executed++;
      } catch (err) {
        console.warn('[init-db] 执行SQL警告:', err.message);
        errors.push(err.message);
      }
    }

    console.log(`[init-db] 执行了 ${executed} 条SQL（共 ${statements.length} 条）`);

    return res.json({
      success: true,
      message: `数据库初始化完成，成功执行 ${executed}/${statements.length} 条语句`,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (err) {
    console.error('[init-db] 初始化失败:', err.message);
    return res.status(500).json({
      success: false,
      message: '数据库初始化失败: ' + err.message
    });
  }
});

// --------------- 服务器启动 ---------------

app.listen(PORT, async () => {
  console.log('========================================');
  console.log('  课程管理系统 - MySQL 版');
  console.log(`  运行地址: http://localhost:${PORT}`);
  console.log(`  健康检查: http://localhost:${PORT}/api/health`);
  console.log(`  数据库: MySQL (${process.env.MYSQL_DATABASE || 'course_management'})`);
  if (process.env.DATABASE_URL || process.env.MYSQL_HOST) {
    console.log('  云端模式: ✅ 已启用环境变量配置');
  }
  console.log('========================================');

  // ★ 连接池预热：服务器启动时立即创建 MySQL 连接池，
  //   避免第一个 API 请求等待 TCP 握手，消除冷启动延迟 ★
  try {
    await getPool();
    console.log('[server] ✅ 数据库连接池已预热，第一个请求无需等待');

    // ★ 自动初始化数据库表结构（云端部署时自动建表） ★
    await ensureDatabase();

    // ★ 缓存预热：启动时立即查询并缓存课程数据，
    //   使第一个 API 请求直接从内存返回，连 MySQL 查询都无需等待 ★
    try {
      const pool = await getPool();
      const [rows] = await pool.execute('SELECT * FROM courses ORDER BY id');
      setCachedCourses(rows);
      console.log('[server] ✅ 课程数据缓存已预热（%d 条记录）', rows.length);
    } catch (cacheErr) {
      console.warn('[server] ⚠️ 课程数据缓存预热失败（首次启动时可忽略）:', cacheErr.message);
    }
  } catch (err) {
    console.error('[server] ❌ 数据库连接池预热失败:', err.message);
    console.error('[server]    请检查 MySQL 服务是否已启动');
  }
});

// 优雅关闭
process.on('SIGINT', async () => {
  console.log('\n[server] 正在关闭...');
  await closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n[server] 正在关闭...');
  await closePool();
  process.exit(0);
});

module.exports = app;
