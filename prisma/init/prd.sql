-- 环境：prd（生产）：仅初始化 admin 账号，其余数据暂不初始化

INSERT INTO "users" ("id", "account", "password_hash", "name", "role", "level", "team", "active", "last_login_at", "created_at", "updated_at") VALUES ('u3', 'wangqiang', '$2a$10$6G72JJbgy5fhlnjTYgDhK.WvPhJYitquJX9VrtZ4idPXvtKCJT/jC', '王强', 'admin', NULL, '研发效能', 1, 1795529870547, 1795153354410, 1795529870548);
