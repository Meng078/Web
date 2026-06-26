/**
 * Database Module
 *
 * MySQL 数据库连接池模块。
 * 使用 mysql2/promise 提供异步连接池，所有 API 路由通过此模块获取数据库连接。
 */

const mysql = require('mysql2/promise');
const dbConfig = require('./config');

let pool = null;

/**
 * 获取数据库连接池（单例模式）
 * @returns {Promise<mysql.Pool>} MySQL 连接池
 */
async function getPool() {
  if (pool) {
    return pool;
  }

  try {
    pool = mysql.createPool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      charset: dbConfig.charset,
      waitForConnections: dbConfig.waitForConnections,
      connectionLimit: dbConfig.connectionLimit,
      queueLimit: dbConfig.queueLimit,
      // 将日期/时间字段作为字符串返回，避免时区转换问题
      dateStrings: true
    });

    // 测试连接是否成功
    const connection = await pool.getConnection();
    console.log(`[db] MySQL 连接池已创建 -> ${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`);
    connection.release();

    return pool;
  } catch (err) {
    console.error('[db] MySQL 连接池创建失败:', err.message);
    console.error('[db] 请确认 MySQL 服务已启动，并且 config.js 中的配置正确');
    throw err;
  }
}

/**
 * 关闭连接池
 */
async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('[db] MySQL 连接池已关闭');
  }
}

module.exports = {
  getPool,
  closePool
};
