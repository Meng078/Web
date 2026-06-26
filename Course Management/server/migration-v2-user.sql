-- ============================================================
-- Migration v2 - 移除"每周最多两次课"的触发器限制
-- 
-- 适用数据库：course_management (MySQL 8.0)
-- 执行方式：在 MySQL 中运行以下命令
--   mysql> source 此文件的完整路径;
--   或直接在 Navicat / DBeaver 等工具中粘贴执行
-- ============================================================

USE `course_management`;

-- 移除插入前触发器（限制同一课程最多2条记录）
DROP TRIGGER IF EXISTS `trg_bi_check_max_two_sessions`;

-- 移除更新前触发器（限制修改时超出2条）
DROP TRIGGER IF EXISTS `trg_bu_check_max_two_sessions`;

SELECT '✅ 两个触发器已成功移除，现在可以为一个课程选择任意多个星期了' AS '执行结果';
