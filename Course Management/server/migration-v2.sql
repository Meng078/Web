-- ============================================================
-- Migration v2: 移除每周最多两次课的限制触发器
-- 原因：支持新版本添加课程时选择多个星期（周一~周日）
-- 原有的触发器限制了每个课程名称最多只能有2条记录
-- ============================================================
-- 使用方式：
--   1. 登录 MySQL: mysql -u root -p
--   2. 切换到目标数据库: USE course_management;
--   3. 执行: source 完整路径/migration-v2.sql
-- ============================================================

USE `course_management`;

-- 移除插入前触发器
DROP TRIGGER IF EXISTS `trg_bi_check_max_two_sessions`;

-- 移除更新前触发器
DROP TRIGGER IF EXISTS `trg_bu_check_max_two_sessions`;

SELECT '触发器已成功移除' AS '迁移状态';
