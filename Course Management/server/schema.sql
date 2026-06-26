-- ============================================================
-- Course Management - MySQL Schema
-- 本 schema 用于 MySQL 数据库，与已上传的 course_management.sql 一致
-- ============================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS `course_management`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `course_management`;

-- ----------------------------
-- 用户表
-- ----------------------------
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

-- ----------------------------
-- 课程表
-- ----------------------------
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

-- ============================================================
-- 种子数据（仅在表为空时插入）
-- ============================================================

-- 用户种子数据
INSERT IGNORE INTO `users` (`id`, `username`, `password`, `name`, `user_type`, `created_at`, `updated_at`) VALUES
(1, 'Dai Yongbin', '$2b$10$OD6OeGSpdslz3aLOP04LNuHDir1/GODZsDiPFBDMZkT5UMnhmT71W', '戴永斌', 'teacher', '2026-06-24 21:11:09', '2026-06-27 14:23:49'),
(2, 'Ma Ying', '$2b$10$CcdtExSGz7q/W4QJgyZQ/.BgqWpEjQymM4FsfYBhHf264FGaxrOoW', '马莹', 'teacher', '2026-06-24 21:11:09', '2026-06-27 14:23:49'),
(11, 'Han Jiaru', '$2b$10$qssokKGT7wEGWnIzOTDthuHC1qwrTs71Thp4wGVh4UkX1jTT1kw.e', '韩佳儒', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(12, 'Yang Suyu', '$2b$10$X2LOCBtWsRPWFYYWt3UFuO.Mzpd/l/NK0JIn1CbbiQygyO/hK7KWO', '杨苏宇', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(13, 'Qu Yuanhao', '$2b$10$7ctaYMRJYwBoMGeRNpGXIuuFhQ4RfvrVVLn3QLc8D6zkVWQk4iGZe', '曲远昊', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(14, 'He Zhenxing', '$2b$10$IESDiLJoHfXLop.2uxNuK.Lug7/eF/J0xNOyUL2TJjzHLtfHQT2Dq', '何振兴', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(15, 'Sun Weilun', '$2b$10$uqysAatyy2YGww484Xlhr.tz5cLX05/E8E/7ZTQZeAbur90/8flGK', '孙玮伦', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(16, 'Zhang Jingyan', '$2b$10$jFdnNsseYOzRn2fSWEHWi.PakP88ckQXGOaslpNOsPsfIjpT66sDi', '张靖岩', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(17, 'Xu Liang', '$2b$10$BmMtPCt6Wi1NsngbCkjeA.F8pRt069yXwW3J0q1dgdIDV5he0yenu', '徐亮', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(18, 'Li Yalong', '$2b$10$e9tAHbmazauVVkgn6klsheH3iys94.8j2O2Rovpp8tQJD.6ISuMEe', '李亚隆', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(19, 'Wu Haolin', '$2b$10$8V9veGW6FH7UCHPi9MTovea7zA2Bd.MEfQD2H08BRmuyFzMaviyuq', '吴昊霖', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(20, 'Xu Yanfei', '$2b$10$9X/vTvyyWKfYLvYHO8UvbezEYKLiAjCD6gYAMYYOAvWhUkXAUgbXq', '徐艳飞', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(21, 'Jiao Xinyu', '$2b$10$IIj6ZP2pGz9GXUqAZ.q8Ku8w6GrzU.XGU1cfNCNK7ZsNuN819t51q', '焦新宇', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(22, 'Wang Xinjie', '$2b$10$L3qSE5Lu7whJN5yy7L/6CuSn1UMTO.a./6Fg03JSopbXFLowgLm6q', '王鑫杰', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(23, 'Zhang Zhan', '$2b$10$Rx1BY1UKdzOllFW08JCKxuqnD0Qx9hnO497jMkJWOf6hXADM6HADe', '张展', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(24, 'Zhu Bin', '$2b$10$eE/trL.0iZ.UpX2VWJAihuOGGoFi0ahDrH4/xqFMhBmd8slKUmbEi', '朱彬', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(25, 'Song Xinyu', '$2b$10$qtaFjyvk1p3X8HPsAqMVdeH/D5P7vtk1.9H2UOeEEMpEzuYRJ6BqS', '宋欣宇', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(26, 'Zhao Shuai', '$2b$10$vBItBMJmVr4eFBV2fGsRK.LsNoXS/r7KNmNfsAigjVlZYxV7Yo5Aq', '赵帅', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(27, 'Jiang Tianyi', '$2b$10$FOhUG4e34q/VZ8e5fSiQVO00JJyLN8e.Fi3j8SsbXlXqFFpIaghJ.', '蒋天毅', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(28, 'Shi Dejian', '$2b$10$0CaoZVanW8yoN4ynSNC8Qe/RKEg55laFecLV6OhJv5916Y0j4QWti', '史德建', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(29, 'Cheng Zhiwei', '$2b$10$U1GqTsLy5RA1anceHrC71u3BExvjh3377flkLDJVLh8B5y4Ls0IRu', '程志伟', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(30, 'Lv Weicheng', '$2b$10$FOFOIq/9yKkJreOF1JYBouY1CqetSKYPAMo9G4qAhI8MsXT6GmS2u', '吕伟成', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(31, 'Ding Yingying', '$2b$10$NNMDcWE2VvnZ1W3aMfrKreoq0v4L6KJLZ91QLIoOdppFf3KXZCBje', '丁莹莹', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(32, 'Zhang Lei', '$2b$10$KkwwLOT6SvP87ODQbLJjVOZ53qMXGUvn6QyHcg7GyrIBBEOgIls8W', '张磊', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(33, 'Li Kai', '$2b$10$hX/Z0GutZxJACfdHghCCRe/5nBBT.EOdmA27O2Hc2AWZ8AjD.mIgO', '李凯', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(34, 'Ma Zhanwei', '$2b$10$KPQaYbNOBJOmDOGXPdJNseFhxpWJvJwDHeUiT7QPNf1.q.ArME7eq', '马占伟', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(35, 'Zhu Fangzheng', '$2b$10$UI65qRzO3sH9lM.zGh7qyuzRFD5FaAGbHMGW73TBfNvGWR.oiJgJS', '朱方正', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(36, 'Jiang Zongxu', '$2b$10$6DTNqSvgCLhOEE3m7.N/mehGEOvFYCqpmI0PZN9CW0YlgbsPSqBl.', '蒋宗旭', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(37, 'Zhang Wenhao', '$2b$10$iQ/dDbBEHFB4xkGEXwEC/eJ..P7bL4H9BNMICI5HF/THEKXY9L3VG', '张文豪', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(38, 'Xu Changqing', '$2b$10$rhi/ghpWpPMQxPd5I1e4KunxRPVLr9huJeE0/7VtBuN5L6Jfsx0Rm', '许长青', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(39, 'Song Xuri', '$2b$10$1.2QVjgGc8SO4r5.FhDkVeO5qBV4y4Kz1E1Y8lDavfqkIqqA4Y3y.', '宋旭日', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(40, 'Zhang Mengyu', '$2b$10$vJ4.PENqdzAUzgEyYRjM/O5Yvpl.N8vBqJgJfMF82nyEYVzHPQin.', '张梦雨', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(41, 'Guan Yu', '$2b$10$nAKusVpDhBvqCkEOnJ6H1OS8uVFnkWQ8q5QE0ujNmWJdXSIN51lLq', '关宇', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(42, 'Cheng Ming', '$2b$10$Q6kMGmtwXANHfpG3Q4n5dOvYcG4/U0pOlxZiEzdn207ydUJWilYVW', '程铭', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(43, 'Shi Tongkun', '$2b$10$bAm0GfiR6jDs/eLdj0E1xukjeeHl/goWCtcSWm4NK8i0Z8KvoQWGS', '石同昆', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(44, 'Hu Xiaoqiang', '$2b$10$wXRf.4n6cBmOzfCoYo0QoOo9GKQBUUNs3.rlG7JkSolJ.XHKPiHaq', '胡小强', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(45, 'Cui Guangrong', '$2b$10$WPJWHwOXsAovpwqXyYxpkeqPQzqZ9.3UFGAoF0RgWbA4bFwZh6Mfq', '崔光嵘', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(46, 'Yang Haibo', '$2b$10$gAhtXHEJgloRAXTIAV9iFuzq8ltgo07XPeI.xcOfD5LBqI7OzRNgm', '杨海波', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(47, 'Ma Qingyang', '$2b$10$9Rzd7ps4PvGsjh3FnfWqKe4BwlnGnAXZRr7aZsUQCOPACJ8IGKxmK', '马庆阳', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(48, 'Song Yuhang', '$2b$10$Ai6o6fWgvhbvGssXf/BpCuvaGvz.q14dIR3UpEwx6dtvGBky3ZS7e', '宋宇航', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(49, 'Jia Yining', '$2b$10$6YP8.v1okLqf4RYOw/MvGeiYAjm4IyY2SNl/AhVjMGjP6S8RBZREK', '贾一宁', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(50, 'Yang Rui', '$2b$10$FfMkI3y3BqEfCQVGoliyu.MAiRAAbEtGR1O7ISW2LQ4EaCQ0cwHjO', '杨蕊', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(51, 'Zhao Yongli', '$2b$10$J.7zZW3T.z7zgK9Ot2cpzOABCsH2Pxe.eWGAXP26RcIOc0.TGDcY.', '赵永利', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(52, 'Yin Qiyang', '$2b$10$1HMxRgZYg/GKNC3LrMFf/O5RDed/PbZHmMIGXWcw2403fxKQBQ3v.', '尹启扬', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(53, 'Yuan Kunpeng', '$2b$10$jq2c7RtyVgk.KLlGPDgECH5F5BKSsMKrcpjNw/4H1Bmxx7g.vW4kS', '袁鲲鹏', 'student', '2026-06-24 21:26:46', '2026-06-27 14:23:49'),
(54, 'Li Xindong', '$2b$10$MEjhOD.94kRwW1gPJbPw8eAlDbCNUCzFzcIinL5eFhkKUvHsWb5L.', '李欣桐', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(55, 'Liu Yuesong', '$2b$10$YPAqI/XWSjvbZttGU.RtRuoalaWg8A2lCEHDAFCV7MDzA5jxIqV9W', '刘跃松', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(56, 'Liu Zhonghao', '$2b$10$AsK5nVF8gRiPF0nlIunNNeXd.dmHt3XZQ1IerMqxKJV7bF/fSGM/a', '刘中豪', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(57, 'Sun Huixuan', '$2b$10$80IBJe0S5OcPahk5QBbP2uT0k5QSjc9NhbtCUalhfQN.oINIhyA2u', '孙慧轩', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(58, 'Zhao Yupei', '$2b$10$PVgSBrkdL/tCMch/Li2sYeQvlFfLwDLStJ0DbUGYDj4JK2LEmF8be', '赵宇培', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(59, 'Zhang Ruilin', '$2b$10$sKcMRRV99zIgyVJqgYIq6uRD93SiYB/p5ExHGGfjy322bqQ9Egt6C', '张瑞麟', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(60, 'Li Yuanqi', '$2b$10$88CAKqgBMrz0LRb2ZVuoxeQAIKHNFBuq.jrRN.VflbLuX4mJbuBd.', '李元琪', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(61, 'Gao Jiashuo', '$2b$10$rwC0fGimNpWcgAGFLxeqCOP4gOF2Uvhjnv2WXL3F5JRFp3DAgfBKK', '高家硕', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(62, 'Cao Wenxin', '$2b$10$b6pJTx2Qb0ftnG2y.0SX3OuoAEoLQ2e6rBp725qhJOKREc/1BUp3C', '曹文鑫', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(63, 'Li Yudi', '$2b$10$ytKFkFwGDYkV/5cHbSRKmeiwWO3aNBHXq5qCqMqoAY3fQJhA/Uil2', '李玉迪', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(64, 'Zuo Qingsong', '$2b$10$rJd7fmqzqMenqJo.dSXbmuM6rrwngYA3MJE.imBgWHfHNedDD.7cS', '左庆松', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(65, 'Wang Xiangyu', '$2b$10$TEg2/VpTFHqZUSFnrEneVe7M4mgeDriJ8vlDTJV6IEiE0LxLzgESe', '王翔宇', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(66, 'Li Yi', '$2b$10$J.Sp.dugQP5nY.DefOjPFeqK6Y7bmK3mMq8WV2.RunWhor6rMFEZS', '李毅', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(67, 'Liu Yue', '$2b$10$giQa/wAnmVbOddju0i4hfOqCLj5YcUAZ8X.gVrgKRHqzJAaCJD3j2', '刘悦', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(68, 'Li Yijing', '$2b$10$G.An/OYHPQ4AtUbyKfhYdelaRUgmqVWP98iZjF4sNJoq9ZnRJS7Ky', '李怡静', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(69, 'Zhu Siyuan', '$2b$10$iXWejBQJdkvQzAWQmPPOqu5ANQ0gOeNk.7qjsNmnZRUEfPDjpP0ru', '朱思源', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(70, 'Tian Baoyi', '$2b$10$LgX9gCMBax0k/ZqRRBOPy.ww0K/eBDtNQ4DB8tYZr2qqs46h1jK3i', '田宝毅', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(71, 'Gao Litao', '$2b$10$8EqZ736Vi6qcjoYqd6G4OOICuRd.wSAq9m.3r4mEnYmR53CMJX.ey', '高立涛', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(72, 'Wang Boxing', '$2b$10$cp7rAavxzTqhh6w1J1Pe0OWB7pxKPsIt63sYnN4NrfipJqR41i4i.', '王博兴', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49'),
(73, 'Meng Zhao', '$2b$10$Cz7HwTVwkN/jXFcNKvHpYOlcsoZQG74aNct8pamVC28H5s0PBfSOK', '孟钊', 'student', '2026-06-24 21:29:08', '2026-06-27 14:23:49');

-- 课程种子数据
INSERT IGNORE INTO `courses` (`id`, `course_name`, `teacher_name`, `course_time`, `course_location`, `weekday`, `time_range`, `start_date`, `end_date`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(1, 'Java Web开发技术', '翟宝峰', '周一 08:00-09:40', '1A221', '周一', '08:00-09:40', '2026-03-09', '2026-06-09', '08:00:00', '09:40:00', '2026-06-24 21:11:17', '2026-06-27 14:23:49'),
(2, 'Java Web开发技术', '翟宝峰', '周五 10:10-11:50', '1A222', '周五', '10:10-11:50', '2026-03-13', '2026-06-12', '10:10:00', '11:50:00', '2026-06-24 21:11:17', '2026-06-27 14:23:49'),
(3, 'Web前端编程框架', '杜颖', '周二 10:10-11:50', '1A221', '周二', '10:10-11:50', '2026-03-10', '2026-06-09', '10:10:00', '11:50:00', '2026-06-24 21:11:17', '2026-06-27 14:23:49'),
(4, 'Web前端编程框架', '杜颖', '周四 10:10-11:50', '1A222', '周四', '10:10-11:50', '2026-03-12', '2026-06-11', '10:10:00', '11:50:00', '2026-06-24 21:11:17', '2026-06-27 14:23:49'),
(5, '软件工程', '戴永斌', '周二 13:30-15:10', '1A322', '周二', '13:30-15:10', '2026-03-03', '2026-06-09', '13:30:00', '15:10:00', '2026-06-24 21:11:17', '2026-06-27 14:23:49'),
(6, '软件工程', '戴永斌', '周四 13:30-15:10', '1A321', '周四', '13:30-15:10', '2026-03-05', '2026-06-11', '13:30:00', '15:10:00', '2026-06-24 21:38:14', '2026-06-27 14:23:49'),
(7, '习近平新时代中国特色社会主义思想概论', '王鑫', '周二 15:40-17:20', '7317', '周二', '15:40-17:20', '2026-03-10', '2026-05-12', '15:40:00', '17:20:00', '2026-06-24 21:42:04', '2026-06-27 14:23:49'),
(8, '习近平新时代中国特色社会主义思想概论', '王鑫', '周四 15:40-17:20', '7303', '周四', '15:40-17:20', '2026-03-12', '2026-05-14', '15:40:00', '17:20:00', '2026-06-24 21:42:41', '2026-06-27 14:23:49'),
(9, '软件测试', '戴永斌', '周三 10:10-11:50', '1A321', '周三', '10:10-11:50', '2026-03-04', '2026-05-13', '10:10:00', '11:50:00', '2026-06-24 21:44:56', '2026-06-27 14:23:49'),
(10, '软件测试', '戴永斌', '周五 08:00-09:40', '1A222', '周五', '08:00-09:40', '2026-03-06', '2026-05-15', '08:00:00', '09:40:00', '2026-06-24 21:47:27', '2026-06-27 14:23:49');
