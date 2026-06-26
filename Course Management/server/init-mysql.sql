-- ============================================================
-- Course Management - MySQL 数据库初始化脚本
-- 使用方式：
--   1. 登录 MySQL: mysql -u root -p
--   2. 执行本脚本: source 完整路径/init-mysql.sql
--   3. 或直接复制运行以下 SQL
-- ============================================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `course_management`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `course_management`;

-- ----------------------------
-- 1. 用户表
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id`         INT           NOT NULL AUTO_INCREMENT COMMENT '用户ID（自增主键）',
  `username`   VARCHAR(50)   NOT NULL COMMENT '用户账号',
  `password`   VARCHAR(255)  NOT NULL COMMENT '账号密码（bcrypt哈希值）',
  `name`       VARCHAR(50)   NOT NULL COMMENT '用户姓名',
  `user_type`  ENUM('teacher','student') NOT NULL DEFAULT 'student' COMMENT '用户类型',
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`) COMMENT '用户账号唯一索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ----------------------------
-- 2. 课程表
-- ----------------------------
DROP TABLE IF EXISTS `courses`;
CREATE TABLE `courses` (
  `id`              INT           NOT NULL AUTO_INCREMENT COMMENT '课程ID（自增主键）',
  `course_name`     VARCHAR(100)  NOT NULL COMMENT '课程名称',
  `teacher_name`    VARCHAR(50)   NOT NULL COMMENT '任课教师姓名',
  `course_time`     VARCHAR(200)  DEFAULT NULL COMMENT '上课时间（如 "周三 08:00-09:40"）',
  `course_location` VARCHAR(200)  DEFAULT NULL COMMENT '上课地点（如 "教学楼J302"）',
  `weekday`         VARCHAR(10)   DEFAULT NULL COMMENT '上课星期',
  `time_range`      VARCHAR(20)   DEFAULT NULL COMMENT '上课时间段',
  `start_date`      DATE          DEFAULT NULL COMMENT '课程开始日期',
  `end_date`        DATE          DEFAULT NULL COMMENT '课程结束日期',
  `start_time`      TIME          DEFAULT NULL COMMENT '上课开始时间',
  `end_time`        TIME          DEFAULT NULL COMMENT '上课结束时间',
  `created_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at`      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_course_weekday` (`course_name`, `weekday`),
  KEY `idx_course_name` (`course_name`) COMMENT '课程名称索引',
  KEY `idx_teacher_name` (`teacher_name`) COMMENT '任课教师索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程管理表';

-- ----------------------------
-- 3. 唯一约束确保同一课程在同一天最多一条记录
-- （注：原有的每周最多两次课限制触发器已移除，支持多日选择）
-- ----------------------------
-- 4. 导入初始数据（使用 bcrypt 哈希后的密码）
--    密码规则：管理员/教师账号密码为 admin123456，学生账号密码为学号
-- ----------------------------

-- 插入用户数据（密码已用 bcrypt 哈希）
INSERT INTO `users` (`id`, `username`, `password`, `name`, `user_type`) VALUES
(1, 'Dai Yongbin', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '戴永斌', 'teacher'),
(2, 'Ma Ying', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '马莹', 'teacher'),
(11, 'Han Jiaru', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '韩佳儒', 'student'),
(12, 'Yang Suyu', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '杨苏宇', 'student'),
(13, 'Qu Yuanhao', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '曲远昊', 'student'),
(14, 'He Zhenxing', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '何振兴', 'student'),
(15, 'Sun Weilun', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '孙玮伦', 'student'),
(16, 'Zhang Jingyan', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '张靖岩', 'student'),
(17, 'Xu Liang', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '徐亮', 'student'),
(18, 'Li Yalong', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '李亚隆', 'student'),
(19, 'Wu Haolin', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '吴昊霖', 'student'),
(20, 'Xu Yanfei', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '徐艳飞', 'student'),
(21, 'Jiao Xinyu', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '焦新宇', 'student'),
(22, 'Wang Xinjie', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '王鑫杰', 'student'),
(23, 'Zhao Yinqi', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '赵音淇', 'student'),
(24, 'Wang Xu', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '王旭', 'student'),
(25, 'Duan Jiayi', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '段佳邑', 'student'),
(26, 'Jiang Yumei', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '姜煜美', 'student'),
(27, 'Lu Hongye', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '吕虹烨', 'student'),
(28, 'Wang Xinyu', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '王新宇', 'student'),
(29, 'Zhang Funing', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '张伏宁', 'student'),
(30, 'Li Xinzhe', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkfAjkMBcGm6vO5GqGXm5H9eKm4Za', '李鑫哲', 'student');

-- 以上 bcrypt 哈希值对应明文密码 "admin123456"，仅供开发环境使用

-- 插入课程数据
INSERT INTO `courses` (`id`, `course_name`, `teacher_name`, `course_time`, `course_location`, `weekday`, `time_range`, `start_date`, `end_date`, `start_time`, `end_time`) VALUES
(1, 'Java Web开发技术', '翟宝峰', '周一 08:00-09:40', '1A221', '周一', '08:00-09:40', '2026-03-09', '2026-06-09', '08:00:00', '09:40:00'),
(2, 'Java Web开发技术', '翟宝峰', '周五 10:10-11:50', '1A222', '周五', '10:10-11:50', '2026-03-13', '2026-06-12', '10:10:00', '11:50:00'),
(3, 'Web前端编程框架', '杜颖', '周二 10:10-11:50', '1A221', '周二', '10:10-11:50', '2026-03-10', '2026-06-09', '10:10:00', '11:50:00'),
(4, 'Web前端编程框架', '杜颖', '周四 10:10-11:50', '1A222', '周四', '10:10-11:50', '2026-03-12', '2026-06-11', '10:10:00', '11:50:00'),
(5, '软件工程', '戴永斌', '周二 13:30-15:10', '1A322', '周二', '13:30-15:10', '2026-03-03', '2026-06-09', '13:30:00', '15:10:00'),
(6, '软件工程', '戴永斌', '周四 13:30-15:10', '1A321', '周四', '13:30-15:10', '2026-03-05', '2026-06-11', '13:30:00', '15:10:00'),
(7, '习近平新时代中国特色社会主义思想概论', '王鑫', '周二 15:40-17:20', '7317', '周二', '15:40-17:20', '2026-03-10', '2026-05-12', '15:40:00', '17:20:00'),
(8, '习近平新时代中国特色社会主义思想概论', '王鑫', '周四 15:40-17:20', '7303', '周四', '15:40-17:20', '2026-03-12', '2026-05-14', '15:40:00', '17:20:00'),
(9, '软件测试', '戴永斌', '周三 10:10-11:50', '1A321', '周三', '10:10-11:50', '2026-03-04', '2026-05-13', '10:10:00', '11:50:00'),
(10, '软件测试', '戴永斌', '周五 08:00-09:40', '1A222', '周五', '08:00-09:40', '2026-03-06', '2026-05-15', '08:00:00', '09:40:00');

-- ----------------------------
-- 验证数据
-- ----------------------------
SELECT 'users count:' AS info, COUNT(*) FROM `users`
UNION ALL
SELECT 'courses count:', COUNT(*) FROM `courses`;
