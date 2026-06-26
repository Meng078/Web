/**
 * MySQL 数据库连接配置
 *
 * 本地开发：使用下方的静态配置
 * 云端部署：通过环境变量覆盖（如 Railway / Zeabur / Docker）
 *
 * 环境变量说明：
 *   MYSQL_HOST     - 数据库主机地址（默认 127.0.0.1）
 *   MYSQL_PORT     - 数据库端口（默认 3306）
 *   MYSQL_USER     - 数据库用户名（默认 root）
 *   MYSQL_PASSWORD - 数据库密码
 *   MYSQL_DATABASE - 数据库名称（默认 course_management）
 *   DATABASE_URL   - Railway 提供的完整连接字符串（优先级最高）
 */

function getConfig() {
  // 优先使用 Railway 提供的 DATABASE_URL
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    return {
      host: url.hostname,
      port: parseInt(url.port || '3306', 10),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      charset: 'utf8mb4',
      connectionLimit: 10,
      waitForConnections: true,
      queueLimit: 0
    };
  }

  return {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'Hykda8848&',
    database: process.env.MYSQL_DATABASE || 'course_management',
    charset: 'utf8mb4',
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
  };
}

module.exports = getConfig();
