CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT           NOT NULL AUTO_INCREMENT COMMENT '用户ID（自增主键）',
  `username`   VARCHAR(50)   NOT NULL COMMENT '用户账号',
  `password`   VARCHAR(255)  NOT NULL COMMENT '账号密码（bcrypt哈希值）',
  `name`       VARCHAR(50)   NOT NULL COMMENT '用户姓名',
  `user_type`  ENUM('teacher','student') NOT NULL DEFAULT 'student' COMMENT '用户类型',
  `created_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

CREATE TABLE IF NOT EXISTS `courses` (
  `id`              INT           NOT NULL AUTO_INCREMENT COMMENT '课程ID（自增主键）',
  `course_name`     VARCHAR(100)  NOT NULL COMMENT '课程名称',
  `teacher_name`    VARCHAR(50)   NOT NULL COMMENT '任课教师姓名',
  `course_time`     VARCHAR(200)  DEFAULT NULL COMMENT '上课时间（如 "周三 08:00-09:40"）',
  `course_location` VARCHAR(200)  DEFAULT NULL COMMENT '上课地点',
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
  KEY `idx_course_name` (`course_name`),
  KEY `idx_teacher_name` (`teacher_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='课程管理表';
