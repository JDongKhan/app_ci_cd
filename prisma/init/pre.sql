-- 由 data/shipflow-qa.db 导出的演示数据；新增数据直接改本文件即可

-- 环境：pre（预发布）

-- users: 6 rows
INSERT INTO "users" ("id", "account", "password_hash", "name", "role", "level", "team", "active", "last_login_at", "created_at", "updated_at") VALUES ('u1', 'chenmo', '$2a$10$6G72JJbgy5fhlnjTYgDhK.WvPhJYitquJX9VrtZ4idPXvtKCJT/jC', '陈默', 'dev', 'l3', '出行 App 组', 1, 1795529875868, 1795153354408, 1795529875869);
INSERT INTO "users" ("id", "account", "password_hash", "name", "role", "level", "team", "active", "last_login_at", "created_at", "updated_at") VALUES ('u2', 'linxiao', '$2a$10$6G72JJbgy5fhlnjTYgDhK.WvPhJYitquJX9VrtZ4idPXvtKCJT/jC', '林晓', 'qa', 'l2', '质量保障组', 1, 1795157623779, 1795153354410, 1795157623779);
INSERT INTO "users" ("id", "account", "password_hash", "name", "role", "level", "team", "active", "last_login_at", "created_at", "updated_at") VALUES ('u3', 'wangqiang', '$2a$10$6G72JJbgy5fhlnjTYgDhK.WvPhJYitquJX9VrtZ4idPXvtKCJT/jC', '王强', 'admin', NULL, '研发效能', 1, 1795529870547, 1795153354410, 1795529870548);
INSERT INTO "users" ("id", "account", "password_hash", "name", "role", "level", "team", "active", "last_login_at", "created_at", "updated_at") VALUES ('u4', 'suqing', '$2a$10$6G72JJbgy5fhlnjTYgDhK.WvPhJYitquJX9VrtZ4idPXvtKCJT/jC', '苏晴', 'pm', 'l1', '海外产品', 1, 1795157669087, 1795153354411, 1795157669088);
INSERT INTO "users" ("id", "account", "password_hash", "name", "role", "level", "team", "active", "last_login_at", "created_at", "updated_at") VALUES ('u5', 'zhouran', '$2a$10$6G72JJbgy5fhlnjTYgDhK.WvPhJYitquJX9VrtZ4idPXvtKCJT/jC', '周然', 'dev', 'l2', '商家工作台', 1, 1795156457986, 1795153354413, 1795156457987);
INSERT INTO "users" ("id", "account", "password_hash", "name", "role", "level", "team", "active", "last_login_at", "created_at", "updated_at") VALUES ('3d7367e4-bac8-41d7-99f1-94ed0a427659', '123', '$2a$10$I2qZubc.gNeXHRn71.zfK..RlZHpR70H/KT8fko8Hxg6nkfVkOEBS', 'JD', 'dev', 'l1', NULL, 1, 1795160025320, 1795153816446, 1795160025321);

-- role_permissions: 79 rows
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l1', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l1', 'board');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l1', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l1', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l2', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l2', 'board');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l2', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l2', 'pipe_create');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l2', 'merge_qa');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l2', 'build_run');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l2', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'board');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'reqs');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'req_create');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'task_create');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'apps');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'app_edit');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'artifact_download');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'pipe_create');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'merge_qa');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'build_run');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l1', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l1', 'board');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l1', 'reqs');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l1', 'req_member');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l1', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l1', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'board');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'reqs');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'req_member');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'merge_uat');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'test_run');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'merge_release');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'verify');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'merge_master');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'accept');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l2', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'board');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'reqs');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'req_member');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'apps');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'app_edit');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'artifact_download');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'build_run');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'merge_uat');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'test_run');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'merge_release');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'verify');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'merge_master');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'accept');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l1', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l1', 'reqs');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l1', 'req_create');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l1', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l1', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l2', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l2', 'board');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l2', 'reqs');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l2', 'req_create');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l2', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l2', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l3', 'home');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l3', 'board');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l3', 'reqs');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l3', 'req_create');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l3', 'artifacts');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l3', 'artifact_download');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('pm', 'l3', 'spec');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'components');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('dev', 'l3', 'component_edit');
INSERT INTO "role_permissions" ("role", "level", "permission_key") VALUES ('qa', 'l3', 'components');

-- apps: 2 rows
INSERT INTO "apps" ("id", "name", "platform", "code", "repo", "default_branch", "build_script", "artifact_type", "artifact_pattern", "branches_json", "machine", "stack", "created_at", "updated_at", "channels", "is_component") VALUES ('b62905f4-22ef-4cf5-9715-2f8dcf297d53', '出行 App', 'android', 'com.travel.overseas.app', 'https://gitee.com/wangjindong/teaching.git', 'master', './build_app', 'apk', 'build/**/*.apk', '{"qa":"qa","uat":"uat","release":"release","master":"master"}', 'builder-01', 'Flutter', 1795154372188, 1795529874753, 'official,googleplay,huawei', 0);
INSERT INTO "apps" ("id", "name", "platform", "code", "repo", "default_branch", "build_script", "artifact_type", "artifact_pattern", "branches_json", "machine", "stack", "created_at", "updated_at", "channels", "is_component") VALUES ('8c46f9f4-7a2d-40ed-a3f5-bed6eff26030', '订单', 'android', 'com.travel.order', 'https://gitee.com/wangjindong/teaching.git', 'main', './build_app', 'apk', NULL, '{"qa":"qa","uat":"uat","release":"release","master":"master"}', 'builder-01', NULL, 1795526980663, 1795526980663, NULL, 1);

-- app_components: 1 rows
INSERT INTO "app_components" ("id", "app_id", "component_app_id", "version", "created_by", "created_at") VALUES ('98dce864-4cee-4d92-bb92-b9c169b59a5c', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53', '8c46f9f4-7a2d-40ed-a3f5-bed6eff26030', NULL, 'u3', 1795526994577);

-- requirements: 2 rows
INSERT INTO "requirements" ("id", "code", "title", "description", "dev_owner_id", "qa_owner_id", "pm_owner_id", "priority", "start_at", "due_at", "created_at", "updated_at") VALUES ('b8b635dd-58a1-4c49-9cb9-cd6e539daa4c', 'REQ-1045', '海外出行首页改版', '首页信息流与推荐位改版，覆盖 Android / iOS。', 'u1', 'u2', 'u4', 'P1', 1795132800000, 1796428800000, 1795154583492, 1795154583492);
INSERT INTO "requirements" ("id", "code", "title", "description", "dev_owner_id", "qa_owner_id", "pm_owner_id", "priority", "start_at", "due_at", "created_at", "updated_at") VALUES ('59f4fd49-a654-41bb-b331-cdd2e95bcef1', 'REQ-1046', '我的城市游戏开发', NULL, 'u1', 'u2', 'u4', 'P0', 1795132800000, 1795737600000, 1795156339918, 1795156339918);

-- requirement_qa_members: 1 rows
INSERT INTO "requirement_qa_members" ("requirement_id", "user_id") VALUES ('b8b635dd-58a1-4c49-9cb9-cd6e539daa4c', 'u2');

-- tasks: 5 rows
INSERT INTO "tasks" ("id", "req_id", "title", "description", "owner_id", "priority", "start_at", "due_at", "status", "status_at", "status_by", "finished_at", "created_at", "updated_at", "deleted_at") VALUES ('2733f26a-db25-4e6b-9a28-ac4b9d8f58a4', 'b8b635dd-58a1-4c49-9cb9-cd6e539daa4c', '首页信息流改版（含推荐位）', '实现信息流列表与推荐位。', 'u5', 'P0', 1795132800000, 1796083200000, 'done', 1795155857008, 'u2', 1795155857008, 1795154803490, 1795155857009, NULL);
INSERT INTO "tasks" ("id", "req_id", "title", "description", "owner_id", "priority", "start_at", "due_at", "status", "status_at", "status_by", "finished_at", "created_at", "updated_at", "deleted_at") VALUES ('608963a6-ad48-4f6e-b6da-3a768859b7eb', 'b8b635dd-58a1-4c49-9cb9-cd6e539daa4c', '临时任务', NULL, 'u1', 'P2', 1795132800000, 1795996800000, 'none', NULL, NULL, NULL, 1795154803745, 1795154803797, 1795154803797);
INSERT INTO "tasks" ("id", "req_id", "title", "description", "owner_id", "priority", "start_at", "due_at", "status", "status_at", "status_by", "finished_at", "created_at", "updated_at", "deleted_at") VALUES ('3aa9c545-cb45-4475-99a8-86bbe087be76', 'b8b635dd-58a1-4c49-9cb9-cd6e539daa4c', '冲突演示任务', NULL, 'u1', 'P2', 1795132800000, 1795996800000, 'dev', 1795155174179, 'u1', NULL, 1795155174136, 1795155174335, 1795155174335);
INSERT INTO "tasks" ("id", "req_id", "title", "description", "owner_id", "priority", "start_at", "due_at", "status", "status_at", "status_by", "finished_at", "created_at", "updated_at", "deleted_at") VALUES ('607cfa48-990e-416c-847a-61768158724c', '59f4fd49-a654-41bb-b331-cdd2e95bcef1', 'html开发', NULL, 'u5', 'P0', 1795132800000, 1795737600000, 'none', NULL, NULL, NULL, 1795156378932, 1795156378932, NULL);
INSERT INTO "tasks" ("id", "req_id", "title", "description", "owner_id", "priority", "start_at", "due_at", "status", "status_at", "status_by", "finished_at", "created_at", "updated_at", "deleted_at") VALUES ('7ef5fe2e-f0c5-4951-90d6-fa3c1b4bca73', '59f4fd49-a654-41bb-b331-cdd2e95bcef1', '接口开发', NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 'P0', 1795132800000, 1795737600000, 'dev', 1795156429766, '3d7367e4-bac8-41d7-99f1-94ed0a427659', NULL, 1795156388867, 1795156429767, NULL);

-- pipelines: 3 rows
INSERT INTO "pipelines" ("id", "task_id", "app_id", "name", "branch", "status", "rework_from", "rework_reason", "rework_by", "rework_at", "created_at", "updated_at") VALUES ('85185d70-ef90-43ce-a627-0450c6c99b4b', '2733f26a-db25-4e6b-9a28-ac4b9d8f58a4', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53', '出行 App · apk', 'feature/home-feed', 'done', NULL, NULL, NULL, NULL, 1795155163882, 1795155856952);
INSERT INTO "pipelines" ("id", "task_id", "app_id", "name", "branch", "status", "rework_from", "rework_reason", "rework_by", "rework_at", "created_at", "updated_at") VALUES ('676660ec-4453-4f9e-b22d-e8555088ebaa', '3aa9c545-cb45-4475-99a8-86bbe087be76', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53', '出行 App · apk', 'feature/conflict-demo', 'dev_merged', NULL, NULL, NULL, NULL, 1795155174195, 1795155174293);
INSERT INTO "pipelines" ("id", "task_id", "app_id", "name", "branch", "status", "rework_from", "rework_reason", "rework_by", "rework_at", "created_at", "updated_at") VALUES ('1ca53ab5-1293-46be-909f-4d22244a1565', '7ef5fe2e-f0c5-4951-90d6-fa3c1b4bca73', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53', '出行 App · apk', 'feature/task-7ef5fe2e', 'dev_built', NULL, NULL, NULL, NULL, 1795156797827, 1795391509628);

-- pipeline_merges: 18 rows
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('9b875a40-ae50-4137-ac20-a802403f7c68', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'qa', 'feature/home-feed', 'qa', '8077608bb2e3853e2164df07e6f58a156811f8c9', 1, 'u1', 1795155174072, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('3c049769-f0d0-4f79-bd65-4ebff9be8761', '676660ec-4453-4f9e-b22d-e8555088ebaa', 'qa', 'temp/Conflict_qa_feature/conflict-demo_26.1120.1412.54', 'qa', '168ff3839c08084efa4a1220edee7d7f2f677aa2', 1, 'u1', 1795155174293, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('5c2c199d-4462-41bb-a4b5-fe0e21cede02', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'uat', 'feature/home-feed', 'uat', '254f240dc9e1583fae8564b69750028aa461d2df', 1, 'u2', 1795155474690, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('3b90c4ca-77cb-4f06-980d-142e7eddf3a9', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'release', 'feature/home-feed', 'release', '3a5a745c4058880b869b926555a4f81ef1a15f3a', 2, 'u2', 1795155474767, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('b18c033e-d5f7-4676-a773-b8aea8f26d21', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'master', 'feature/home-feed', 'master', '443d0c004987889f114964920177248e4a5a6fff', 3, 'u2', 1795155856953, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('5b318a97-97f0-4829-92d9-c1ca6c1e306a', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', 'c78e3050bc69e36d7781ef7188c63a6e4ee2e68f', 2, 'u3', 1795156800013, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('08a7acd5-115d-4263-9a11-ac3f80101a8a', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '013923d65c9e7ee03e7cb08ea7bc688f724a6a12', 2, 'u3', 1795156806509, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('b384fbf7-ecae-4966-873a-188315bf62b4', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '3d29da7875b16a2a0e01db5c0952cd737281535d', 1, 'u3', 1795156810993, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('03665cda-6a11-4429-b691-63249e7fd140', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '194068fb8cdb82f5f80e2f6edad55c0e247cc795', 1, 'u3', 1795157005079, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('979f6dad-9d75-46ba-b3df-fab9b957fb30', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '1bd7629a7116547a3b961f9bf45add114e625949', 2, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158938008, 1795159306050, '自测拒绝');
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('a6a63824-28cc-4492-affb-7817302e668b', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '1bd7629a7116547a3b961f9bf45add114e625949', 0, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159312607, 1795159838339, '自测拒绝');
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('52c727ee-5ac0-47ae-aec8-08121aff9f87', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '1bd7629a7116547a3b961f9bf45add114e625949', 0, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159841674, 1795160031037, '自测拒绝');
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('e3e043a0-e5ad-4ecb-ae57-1f98fdf4582a', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '1bd7629a7116547a3b961f9bf45add114e625949', 0, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160034759, 1795160094532, '自测拒绝');
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('2d76726d-db81-4472-89c5-bda1271a0672', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '1bd7629a7116547a3b961f9bf45add114e625949', 0, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160097593, 1795390343887, '自测拒绝');
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('644f06d6-66a0-47ab-802e-b0432540778e', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '6342c4e5c8fba239523a5a6d300f15f23c32eaef', 2, 'u3', 1795390398394, NULL, NULL);
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('2af07fa8-c887-4238-a4c2-5b61be203560', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '1faf6b685368a54c76493813f4bdaed8604e771f', 1, 'u3', 1795391049517, 1795391217611, '自测拒绝');
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('db6b6c63-a6d4-47a0-b561-05ae1e0cccd6', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '1faf6b685368a54c76493813f4bdaed8604e771f', 0, 'u3', 1795391219654, 1795391503458, '自测拒绝');
INSERT INTO "pipeline_merges" ("id", "pipeline_id", "stage", "from_branch", "to_branch", "sha", "commits", "operator_id", "merged_at", "invalidated_at", "invalidated_reason") VALUES ('d628033a-1dd2-438d-a637-1fc56dba89b2', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 'feature/task-7ef5fe2e', 'qa', '2a8bfaa13e0833aa493c28e07ad015daf1b3e2d6', 1, 'u3', 1795391505481, NULL, NULL);

-- pipeline_conflicts: 1 rows
INSERT INTO "pipeline_conflicts" ("id", "pipeline_id", "stage", "temp_branch", "created_at", "resolved_at", "resolved_by") VALUES ('b8f0f5f5-cb73-4a0d-9074-9b4da64865e4', '676660ec-4453-4f9e-b22d-e8555088ebaa', 'qa', 'temp/Conflict_qa_feature/conflict-demo_26.1120.1412.54', 1795155174244, 1795155174291, 'u1');

-- pipeline_conflict_files: 2 rows
INSERT INTO "pipeline_conflict_files" ("id", "conflict_id", "path") VALUES ('c8819bb3-9f3d-4c59-a598-ef18eebd4e74', 'b8f0f5f5-cb73-4a0d-9074-9b4da64865e4', 'lib/features/transfer/transfer_service.dart');
INSERT INTO "pipeline_conflict_files" ("id", "conflict_id", "path") VALUES ('3e29d018-166f-48ae-88e6-fc4e62e1d627', 'b8f0f5f5-cb73-4a0d-9074-9b4da64865e4', 'lib/features/transfer/widgets/transfer_card.dart');

-- pipeline_events: 69 rows
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('75edfac6-069c-49de-9f20-2402abdfb6cf', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'merge_started', 'none', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u1', 1795155174068);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('b7c01149-bebc-425c-a419-d340a067ef3c', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa"}', 'u1', 1795155174072);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('a9531c6a-93c8-4eea-8f6b-e4f596094462', '676660ec-4453-4f9e-b22d-e8555088ebaa', 'merge_started', 'none', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u1', 1795155174242);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('17ab55ad-b078-47fa-8b04-4307028780dd', '676660ec-4453-4f9e-b22d-e8555088ebaa', 'merge_conflict', 'dev_merging', 'dev_conflict', '{"stage":"qa","tempBranch":"temp/Conflict_qa_feature/conflict-demo_26.1120.1412.54","files":["lib/features/transfer/transfer_service.dart","lib/features/transfer/widgets/transfer_card.dart"]}', 'u1', 1795155174245);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('e40715d9-30d9-4ded-b4a3-ae536b567fe0', '676660ec-4453-4f9e-b22d-e8555088ebaa', 'conflict_resolved', 'dev_conflict', 'dev_merged', '{"stage":"qa","tempBranch":"temp/Conflict_qa_feature/conflict-demo_26.1120.1412.54"}', 'u1', 1795155174293);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('3a3e442b-f97a-468b-ad20-a05d07134b65', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"65f3e0ed-b3a6-4878-8f7f-719daa9973cd","exitCode":0,"failReason":null}', 'u1', 1795155464261);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('21f80f22-0be3-401e-81d6-4ecb1da146e7', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'qa_passed', 'dev_built', 'dev_passed', NULL, 'u1', 1795155474554);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('bc69f3bc-bd26-4dae-abf2-e64b35784979', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'merge_started', 'dev_passed', 'test_merging', '{"stage":"uat","toBranch":"uat"}', 'u2', 1795155474688);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('73786694-a146-4af0-93fc-b654e77fb368', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'merge_succeeded', 'test_merging', 'testing', '{"stage":"uat","toBranch":"uat"}', 'u2', 1795155474691);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('a82ccfd6-0a0e-459a-8f8e-35e783743303', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'merge_started', 'testing', 'release_merging', '{"stage":"release","toBranch":"release"}', 'u2', 1795155474761);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('74cb3269-2478-489c-b05a-918c3642949e', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'merge_succeeded', 'release_merging', 'release_check', '{"stage":"release","toBranch":"release"}', 'u2', 1795155474767);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('79029126-ba8c-44b6-a241-3703952bb450', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'build_succeeded', NULL, NULL, '{"stage":"release","buildId":"9c09ada8-f9ae-466a-9d59-bddaa6e99435","exitCode":0,"failReason":null}', 'u1', 1795155487856);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('a7623fd5-c9c0-4a1d-8829-6bc136ff6656', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'build_succeeded', NULL, NULL, '{"stage":"release","buildId":"7b5fb9bd-7893-47ad-a856-0ba662e74905","exitCode":0,"failReason":null}', 'u1', 1795155675168);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('20a7114a-a868-4504-af3f-3b54bdce7dff', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'release_verified', 'release_check', 'release_verified', NULL, 'u2', 1795155856886);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('dac78fce-a87c-49e3-bf70-eedfc7f53fae', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'merge_started', 'release_verified', 'accept_merging', '{"stage":"master","toBranch":"master"}', 'u2', 1795155856951);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('5eb83bd3-c677-489f-8855-3c0cec3c5d8d', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'merge_succeeded', 'accept_merging', 'done', '{"stage":"master","toBranch":"master"}', 'u2', 1795155856954);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('e721842d-bf12-4b28-81ac-dbd2fade8365', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'none', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u3', 1795156800005);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('1f2e47be-4b35-4578-83c7-2cebe3d3a499', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"simulated"}', 'u3', 1795156800029);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('5f77f09c-ddb5-43e0-8868-d3427279a44c', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u3', 1795156806505);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('7552c28d-7db9-406f-a980-224ba4b39c1f', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"simulated"}', 'u3', 1795156806510);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('04875585-5d8a-40a2-bd17-3744d5d854e9', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u3', 1795156810987);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('3f20a8ed-9ac9-4151-a920-ab4be5aae371', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"simulated"}', 'u3', 1795156810995);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('e7730e6b-bcc9-4b50-b830-84b83df3b5a2', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u3', 1795157005074);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('b89af4c0-52b7-47ce-b9dd-3fa06d4be89b', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"simulated"}', 'u3', 1795157005080);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('8fb71e61-060c-4474-97eb-d7c1b5b1d9c7', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"533f31ab-4687-4d38-9f34-4574995fc85d","exitCode":0,"failReason":null}', 'u3', 1795157010999);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('6faca35c-bb08-40fa-9c35-a8ff56548091', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_failed', NULL, NULL, '{"stage":"qa","buildId":"bc128eda-0bc5-4952-8aed-8cc97194bd93","exitCode":127,"failReason":"构建脚本退出码 127"}', 'u3', 1795157051083);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('7166a8d4-469d-4759-86e1-ff568629d83c', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_failed', NULL, NULL, '{"stage":"qa","buildId":"3a96b110-3a95-490e-9803-a6e9103b9618","exitCode":127,"failReason":"构建脚本退出码 127"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795157891591);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('bc3f7ed9-7122-4d2a-a496-ab09f8946ddf', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_failed', NULL, NULL, '{"stage":"qa","buildId":"590a7368-c9e1-4952-b032-007e5fe45ec5","exitCode":127,"failReason":"构建脚本退出码 127"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158279135);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('3b425d6a-df3a-4bcf-9e12-2c668f94348c', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"41db0c9d-b6a9-49b1-90c3-0d8a8e9e4106","exitCode":0,"failReason":null}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158388076);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('98812ad8-7b79-4d30-acd9-ba4fde7be7d6', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_built', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158935617);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('917c4e36-b7eb-4dc8-bad8-4093d1bb4932', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158938009);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('fcbdfcfe-3820-4984-94e6-43920ec2adae', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"5e35d485-0678-4967-915d-a9c1d205d492","exitCode":0,"failReason":null}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158959003);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('9b050b1f-563e-40a5-b34f-e63cd55894b8', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa_rejected', 'dev_built', 'dev_merged', '{"reason":"自测拒绝"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159306054);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('7d7b5561-d1ff-4c88-9637-bef07ac659ae', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159310125);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('56c1b7ed-80f2-45a5-84a2-e9c7bbc73ecc', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159312610);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('d5e44d93-25ee-4506-a290-0e19b7aee24d', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"2e332bd6-7437-444d-96b3-82d4218532f8","exitCode":0,"failReason":null}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159315367);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('e5006be7-d196-481a-852d-8dc4b625bf52', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa_rejected', 'dev_built', 'dev_merged', '{"reason":"自测拒绝"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159838343);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('1d307bad-2edb-428e-9acf-bf44658f61b1', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159839189);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('a1369418-0d8c-463f-8a99-2e8614197830', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159841675);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('e3296a4a-330e-4107-a968-baafe9bff098', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"054ead73-2e19-402d-b10b-bc929a53ac0c","exitCode":0,"failReason":null}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159844224);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('e5c934ff-c839-4aba-9132-afc57ef7055a', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa_rejected', 'dev_built', 'dev_merged', '{"reason":"自测拒绝"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160031041);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('4d3b1fee-e738-4878-8922-831dc524e5af', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160031875);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('f66a8a99-fe8e-4aa8-bcef-fdbe4363a7b8', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160034760);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('8903dc5e-f6ab-4533-9990-1942a21dfd87', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"f97cb0b2-b02e-4b45-9c62-dc1e50a79ee6","exitCode":0,"failReason":null}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160037868);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('96f53a3d-d314-4fc1-b4bc-1473ccab0584', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa_rejected', 'dev_built', 'dev_merged', '{"reason":"自测拒绝"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160094536);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('67bcee1e-4e6b-478b-8c3d-e394c269d204', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160095403);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('05135af6-61d9-4a9a-aaae-e518faa6dd8a', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160097594);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('2c7ba882-96b9-499b-8046-b2dbe89380cf', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"0c3afb5e-47a0-4303-869b-d02bf4f11d9b","exitCode":0,"failReason":null}', '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160099662);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('03a89bef-dc6d-42d2-b68d-ada64e7ec0d4', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_failed', NULL, NULL, '{"stage":"qa","buildId":"1717c06d-3113-402b-aa73-ebdb83ad4bc8","exitCode":1,"failReason":"克隆仓库失败：正克隆到 ''/Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53''...\nssh: Could not resolve hostname git.17usoft.com: nodename nor servname provided, or not known\r\n致命错误：无法读取远程仓库。\n\n请确认您有正确的访问权限并且仓库存在。"}', 'u3', 1795363484576);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('09518956-c27d-4daf-903d-0e8ca9e826fb', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"a03d98f2-1999-471c-8e47-da37ed86608d","exitCode":0,"failReason":null}', 'u3', 1795363519079);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('3e7b968d-4045-493b-91d5-d8b64c1a0971', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa_rejected', 'dev_built', 'dev_merged', '{"reason":"自测拒绝"}', 'u3', 1795390343892);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('cc89cbc3-c79f-4a3b-b9c5-232b1bfb4af2', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u3', 1795390397260);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('9e955967-7fa6-45c7-9cec-ec49f90ceb82', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', 'u3', 1795390398395);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('23d8ad90-23e3-456b-822a-bdd635afdf36', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_failed', NULL, NULL, '{"stage":"qa","buildId":"bfa661ac-572d-443d-a12b-a4a1eb997020","exitCode":127,"failReason":"构建脚本退出码 127"}', 'u3', 1795390418178);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('c5b67eb9-d72d-47a6-92a9-bc75dad35a4e', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"54ec1490-05fd-4fcf-a485-e1128c4a1bea","exitCode":0,"failReason":null}', 'u3', 1795390803321);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('2eaa4efe-de5b-4eb8-b71b-6aef9b93a38f', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_built', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u3', 1795391048546);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('70ff5178-25c0-4257-92b4-5bca75527917', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', 'u3', 1795391049518);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('da2e2256-c5ee-4f2d-82a8-940099ce4c91', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"5614e1c7-6d0b-41e9-9395-2a79f9abc467","exitCode":0,"failReason":null}', 'u3', 1795391058131);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('c2da99c2-e915-4a99-936f-947e51b6fb62', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"d2b259df-efeb-4cec-bf4d-9ba7f94d5e18","exitCode":0,"failReason":null}', 'u3', 1795391187209);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('9549f4f9-1e58-4a6a-809e-fab5af0d2b9c', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa_rejected', 'dev_built', 'dev_merged', '{"reason":"自测拒绝"}', 'u3', 1795391217615);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('89cedf46-2a63-4ebf-8696-3595e6324f31', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u3', 1795391218952);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('3f08d660-e622-48c1-9c7d-7e9868fae643', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', 'u3', 1795391219655);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('4951dd2d-c6bc-4551-8a97-f6fff3ca0307', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"0e9a807b-e4b9-439f-b1e9-8a7533805cdf","exitCode":0,"failReason":null}', 'u3', 1795391223836);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('7dd01671-d3b5-4ff0-a70f-64c2347ec441', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"cf55ac71-e22f-44f2-803f-956e08d1ff3a","exitCode":0,"failReason":null}', 'u3', 1795391308803);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('5bc7fe3a-9721-4125-bf8e-641b5b69289d', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"0e7b3099-523d-4839-a391-a92eedf01fe8","exitCode":0,"failReason":null}', 'u3', 1795391442311);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('fc1a8514-d192-4fa5-be80-d63ddd93c5ae', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa_rejected', 'dev_built', 'dev_merged', '{"reason":"自测拒绝"}', 'u3', 1795391503461);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('e5d518e5-0196-4af1-8c8b-6be1edc73cc0', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_started', 'dev_merged', 'dev_merging', '{"stage":"qa","toBranch":"qa"}', 'u3', 1795391504680);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('87cbe472-4010-49e2-87ab-9dff8d641c4b', '1ca53ab5-1293-46be-909f-4d22244a1565', 'merge_succeeded', 'dev_merging', 'dev_merged', '{"stage":"qa","toBranch":"qa","mode":"real"}', 'u3', 1795391505482);
INSERT INTO "pipeline_events" ("id", "pipeline_id", "type", "from_status", "to_status", "payload_json", "actor_id", "created_at") VALUES ('1a6c0740-8eea-45e2-813c-3021c7b99f77', '1ca53ab5-1293-46be-909f-4d22244a1565', 'build_succeeded', NULL, 'dev_built', '{"stage":"qa","buildId":"c4d6c02d-6ba0-4b67-a688-dee9ea571a2b","exitCode":0,"failReason":null}', 'u3', 1795391509628);

-- builds: 17 rows
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('65f3e0ed-b3a6-4878-8f7f-719daa9973cd', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'qa', 0, NULL, NULL, '8077608bb2e3853e2164df07e6f58a156811f8c9', 'success', 100, 1795155461166, 1795155464253, 3087, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/65f3e0ed-b3a6-4878-8f7f-719daa9973cd.log', 799, '[2026-11-20 14:17:41] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 14:17:41] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 14:17:41] [stdout] Feature 分支 feature/home-feed
[2026-11-20 14:17:41] [stdout] 合并提交 8077608bb2e3853e2164df07e6f58a156811f8c9
[2026-11-20 14:17:41] [stdout] 构建脚本 ./build_app
[2026-11-20 14:17:41] [stdout] 准备构建环境
[2026-11-20 14:17:42] [stdout] 拉取代码 feature/home-feed
[2026-11-20 14:17:42] [stdout] 校验合并提交
[2026-11-20 14:17:43] [stdout] 执行构建脚本：./build_app
[2026-11-20 14:17:43] [stdout] 扫描产物
[2026-11-20 14:17:44] [stdout] 构建完成
[2026-11-20 14:17:44] [stdout] 构建成功
[2026-11-20 14:17:44] [stdout] 退出码 0 · 耗时 3087ms
', 0, NULL, 'u1', 1795155461164, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('9c09ada8-f9ae-466a-9d59-bddaa6e99435', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'release', 0, NULL, NULL, '3a5a745c4058880b869b926555a4f81ef1a15f3a', 'success', 100, 1795155484824, 1795155487849, 3025, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/9c09ada8-f9ae-466a-9d59-bddaa6e99435.log', 804, '[2026-11-20 14:18:04] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 Release
[2026-11-20 14:18:04] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 14:18:04] [stdout] Feature 分支 feature/home-feed
[2026-11-20 14:18:04] [stdout] 合并提交 3a5a745c4058880b869b926555a4f81ef1a15f3a
[2026-11-20 14:18:04] [stdout] 构建脚本 ./build_app
[2026-11-20 14:18:05] [stdout] 准备构建环境
[2026-11-20 14:18:05] [stdout] 拉取代码 feature/home-feed
[2026-11-20 14:18:06] [stdout] 校验合并提交
[2026-11-20 14:18:06] [stdout] 执行构建脚本：./build_app
[2026-11-20 14:18:07] [stdout] 扫描产物
[2026-11-20 14:18:07] [stdout] 构建完成
[2026-11-20 14:18:07] [stdout] 构建成功
[2026-11-20 14:18:07] [stdout] 退出码 0 · 耗时 3025ms
', 0, NULL, 'u1', 1795155484823, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('7b5fb9bd-7893-47ad-a856-0ba662e74905', '85185d70-ef90-43ce-a627-0450c6c99b4b', 'release', 0, NULL, NULL, '3a5a745c4058880b869b926555a4f81ef1a15f3a', 'success', 100, 1795155672126, 1795155675156, 3030, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/7b5fb9bd-7893-47ad-a856-0ba662e74905.log', 804, '[2026-11-20 14:21:12] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 Release
[2026-11-20 14:21:12] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 14:21:12] [stdout] Feature 分支 feature/home-feed
[2026-11-20 14:21:12] [stdout] 合并提交 3a5a745c4058880b869b926555a4f81ef1a15f3a
[2026-11-20 14:21:12] [stdout] 构建脚本 ./build_app
[2026-11-20 14:21:12] [stdout] 准备构建环境
[2026-11-20 14:21:13] [stdout] 拉取代码 feature/home-feed
[2026-11-20 14:21:13] [stdout] 校验合并提交
[2026-11-20 14:21:14] [stdout] 执行构建脚本：./build_app
[2026-11-20 14:21:14] [stdout] 扫描产物
[2026-11-20 14:21:15] [stdout] 构建完成
[2026-11-20 14:21:15] [stdout] 构建成功
[2026-11-20 14:21:15] [stdout] 退出码 0 · 耗时 3030ms
', 0, NULL, 'u1', 1795155672123, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('533f31ab-4687-4d38-9f34-4574995fc85d', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 0, NULL, NULL, '194068fb8cdb82f5f80e2f6edad55c0e247cc795', 'success', 100, 1795157007907, 1795157010992, 3085, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/533f31ab-4687-4d38-9f34-4574995fc85d.log', 894, '[2026-11-20 14:43:27] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 14:43:27] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 14:43:27] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 14:43:27] [stdout] 合并提交 194068fb8cdb82f5f80e2f6edad55c0e247cc795
[2026-11-20 14:43:27] [stdout] 构建脚本 ./build_app
[2026-11-20 14:43:27] [stdout] 执行模式：模拟构建（workspace 未初始化）
[2026-11-20 14:43:28] [stdout] 准备构建环境
[2026-11-20 14:43:28] [stdout] 拉取代码 feature/task-7ef5fe2e
[2026-11-20 14:43:29] [stdout] 校验合并提交
[2026-11-20 14:43:29] [stdout] 执行构建脚本：./build_app
[2026-11-20 14:43:30] [stdout] 扫描产物
[2026-11-20 14:43:30] [stdout] 构建完成
[2026-11-20 14:43:30] [stdout] 构建成功
[2026-11-20 14:43:30] [stdout] 退出码 0 · 耗时 3085ms
', 0, NULL, 'u3', 1795157007882, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('bc128eda-0bc5-4952-8aed-8cc97194bd93', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 0, NULL, NULL, '194068fb8cdb82f5f80e2f6edad55c0e247cc795', 'failed', 11, 1795157049394, 1795157051078, 1684, 127, '构建脚本退出码 127', '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/bc128eda-0bc5-4952-8aed-8cc97194bd93.log', 802, '[2026-11-20 14:44:09] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 14:44:09] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 14:44:09] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 14:44:09] [stdout] 合并提交 194068fb8cdb82f5f80e2f6edad55c0e247cc795
[2026-11-20 14:44:09] [stdout] 构建脚本 ./build_app
[2026-11-20 14:44:09] [stdout] 执行模式：真实构建（workspace 已就绪）
[2026-11-20 14:44:09] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 14:44:11] [stderr] bash: ./build_app: No such file or directory
[2026-11-20 14:44:11] [stderr] 构建失败：构建脚本退出码 127
[2026-11-20 14:44:11] [stdout] 退出码 127 · 耗时 1684ms
', 0, NULL, 'u3', 1795157049385, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('3a96b110-3a95-490e-9803-a6e9103b9618', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 0, NULL, NULL, '194068fb8cdb82f5f80e2f6edad55c0e247cc795', 'failed', 11, 1795157880873, 1795157891588, 10715, 127, '构建脚本退出码 127', '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/3a96b110-3a95-490e-9803-a6e9103b9618.log', 871, '[2026-11-20 14:58:00] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 14:58:00] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 14:58:00] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 14:58:00] [stdout] 合并提交 194068fb8cdb82f5f80e2f6edad55c0e247cc795
[2026-11-20 14:58:00] [stdout] 构建脚本 ./build_app
[2026-11-20 14:58:00] [stdout] 检查工作区，必要时克隆仓库
[2026-11-20 14:58:10] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-20 14:58:10] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 14:58:11] [stderr] bash: ./build_app: No such file or directory
[2026-11-20 14:58:11] [stderr] 构建失败：构建脚本退出码 127
[2026-11-20 14:58:11] [stdout] 退出码 127 · 耗时 10715ms
', 0, NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795157880865, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('590a7368-c9e1-4952-b032-007e5fe45ec5', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 7, '1.0.0', 7, '194068fb8cdb82f5f80e2f6edad55c0e247cc795', 'failed', 11, 1795158278071, 1795158279133, 1062, 127, '构建脚本退出码 127', '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/590a7368-c9e1-4952-b032-007e5fe45ec5.log', 1145, '[2026-11-20 15:04:38] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 15:04:38] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:04:38] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 15:04:38] [stdout] 合并提交 194068fb8cdb82f5f80e2f6edad55c0e247cc795
[2026-11-20 15:04:38] [stdout] 构建脚本 ./build_app
[2026-11-20 15:04:38] [stdout] 检查工作区，必要时克隆仓库
[2026-11-20 15:04:38] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-20 15:04:38] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:04:38] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=7 BUILD_NUMBER=7
[2026-11-20 15:04:38] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-20 15:04:38] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-20 15:04:39] [stderr] bash: ./build_app: No such file or directory
[2026-11-20 15:04:39] [stderr] 构建失败：构建脚本退出码 127
[2026-11-20 15:04:39] [stdout] 退出码 127 · 耗时 1062ms
', 0, NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158278064, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('41db0c9d-b6a9-49b1-90c3-0d8a8e9e4106', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 8, '1.0.0', 8, '194068fb8cdb82f5f80e2f6edad55c0e247cc795', 'success', 100, 1795158386228, 1795158388071, 1843, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/41db0c9d-b6a9-49b1-90c3-0d8a8e9e4106.log', 1223, '[2026-11-20 15:06:26] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 15:06:26] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:06:26] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 15:06:26] [stdout] 合并提交 194068fb8cdb82f5f80e2f6edad55c0e247cc795
[2026-11-20 15:06:26] [stdout] 构建脚本 ./build_app
[2026-11-20 15:06:26] [stdout] 检查工作区，必要时克隆仓库
[2026-11-20 15:06:26] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-20 15:06:26] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:06:26] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=8 BUILD_NUMBER=8
[2026-11-20 15:06:26] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-20 15:06:26] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-20 15:06:28] [stdout] 11233
[2026-11-20 15:06:28] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-20 15:06:28] [stdout] 产物扫描完成：0 个文件入库
[2026-11-20 15:06:28] [stdout] 构建成功
[2026-11-20 15:06:28] [stdout] 退出码 0 · 耗时 1843ms
', 0, NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158386222, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('5e35d485-0678-4967-915d-a9c1d205d492', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 9, '1.0.0', 9, '1bd7629a7116547a3b961f9bf45add114e625949', 'success', 100, 1795158957207, 1795158958998, 1791, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/5e35d485-0678-4967-915d-a9c1d205d492.log', 1223, '[2026-11-20 15:15:57] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 15:15:57] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:15:57] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 15:15:57] [stdout] 合并提交 1bd7629a7116547a3b961f9bf45add114e625949
[2026-11-20 15:15:57] [stdout] 构建脚本 ./build_app
[2026-11-20 15:15:57] [stdout] 检查工作区，必要时克隆仓库
[2026-11-20 15:15:57] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-20 15:15:57] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:15:57] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=9 BUILD_NUMBER=9
[2026-11-20 15:15:57] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-20 15:15:57] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-20 15:15:58] [stdout] 11233
[2026-11-20 15:15:58] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-20 15:15:58] [stdout] 产物扫描完成：0 个文件入库
[2026-11-20 15:15:58] [stdout] 构建成功
[2026-11-20 15:15:58] [stdout] 退出码 0 · 耗时 1791ms
', 0, NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795158957201, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('2e332bd6-7437-444d-96b3-82d4218532f8', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 10, '1.0.0', 10, '1bd7629a7116547a3b961f9bf45add114e625949', 'success', 100, 1795159313879, 1795159315363, 1484, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/2e332bd6-7437-444d-96b3-82d4218532f8.log', 1225, '[2026-11-20 15:21:53] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 15:21:53] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:21:53] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 15:21:53] [stdout] 合并提交 1bd7629a7116547a3b961f9bf45add114e625949
[2026-11-20 15:21:53] [stdout] 构建脚本 ./build_app
[2026-11-20 15:21:53] [stdout] 检查工作区，必要时克隆仓库
[2026-11-20 15:21:53] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-20 15:21:53] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:21:53] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=10 BUILD_NUMBER=10
[2026-11-20 15:21:53] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-20 15:21:53] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-20 15:21:55] [stdout] 11233
[2026-11-20 15:21:55] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-20 15:21:55] [stdout] 产物扫描完成：0 个文件入库
[2026-11-20 15:21:55] [stdout] 构建成功
[2026-11-20 15:21:55] [stdout] 退出码 0 · 耗时 1484ms
', 0, NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159313872, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('054ead73-2e19-402d-b10b-bc929a53ac0c', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 11, '1.0.0', 11, '1bd7629a7116547a3b961f9bf45add114e625949', 'success', 100, 1795159842891, 1795159844219, 1328, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/054ead73-2e19-402d-b10b-bc929a53ac0c.log', 1338, '[2026-11-20 15:30:42] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 15:30:42] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:30:42] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 15:30:42] [stdout] 合并提交 1bd7629a7116547a3b961f9bf45add114e625949
[2026-11-20 15:30:42] [stdout] 构建脚本 set -e
./build_app
mkdir -p build
if [ -d download ]; then
  find download -type f -name ''*.apk'' -exec cp -f {} build/ \;
fi
[2026-11-20 15:30:42] [stdout] 检查工作区，必要时克隆仓库
[2026-11-20 15:30:42] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-20 15:30:42] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:30:42] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=11 BUILD_NUMBER=11
[2026-11-20 15:30:42] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-20 15:30:42] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-20 15:30:44] [stdout] 11233
[2026-11-20 15:30:44] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-20 15:30:44] [stdout] 产物扫描完成：0 个文件入库
[2026-11-20 15:30:44] [stdout] 构建成功
[2026-11-20 15:30:44] [stdout] 退出码 0 · 耗时 1328ms
', 0, NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795159842884, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('f97cb0b2-b02e-4b45-9c62-dc1e50a79ee6', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 12, '1.0.0', 12, '1bd7629a7116547a3b961f9bf45add114e625949', 'success', 100, 1795160036565, 1795160037863, 1298, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/f97cb0b2-b02e-4b45-9c62-dc1e50a79ee6.log', 1352, '[2026-11-20 15:33:56] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 15:33:56] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:33:56] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 15:33:56] [stdout] 合并提交 1bd7629a7116547a3b961f9bf45add114e625949
[2026-11-20 15:33:56] [stdout] 构建脚本 set -e
./build_app
mkdir -p build
if [ -d "$DOWNLOAD_DIR" ]; then
  find "$DOWNLOAD_DIR" -type f -name ''*.apk'' -exec cp -f {} build/ \;
fi
[2026-11-20 15:33:56] [stdout] 检查工作区，必要时克隆仓库
[2026-11-20 15:33:56] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-20 15:33:56] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:33:56] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=12 BUILD_NUMBER=12
[2026-11-20 15:33:56] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-20 15:33:56] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-20 15:33:57] [stdout] 11233
[2026-11-20 15:33:57] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-20 15:33:57] [stdout] 产物扫描完成：1 个文件入库
[2026-11-20 15:33:57] [stdout] 构建成功
[2026-11-20 15:33:57] [stdout] 退出码 0 · 耗时 1298ms
', 0, NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160036556, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('0c3afb5e-47a0-4303-869b-d02bf4f11d9b', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 13, '1.0.0', 13, '1bd7629a7116547a3b961f9bf45add114e625949', 'success', 100, 1795160098473, 1795160099659, 1186, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/0c3afb5e-47a0-4303-869b-d02bf4f11d9b.log', 1352, '[2026-11-20 15:34:58] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-20 15:34:58] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:34:58] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-20 15:34:58] [stdout] 合并提交 1bd7629a7116547a3b961f9bf45add114e625949
[2026-11-20 15:34:58] [stdout] 构建脚本 set -e
./build_app
mkdir -p build
if [ -d "$DOWNLOAD_DIR" ]; then
  find "$DOWNLOAD_DIR" -type f -name ''*.apk'' -exec cp -f {} build/ \;
fi
[2026-11-20 15:34:58] [stdout] 检查工作区，必要时克隆仓库
[2026-11-20 15:34:58] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-20 15:34:58] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-20 15:34:58] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=13 BUILD_NUMBER=13
[2026-11-20 15:34:58] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-20 15:34:58] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-20 15:34:59] [stdout] 11233
[2026-11-20 15:34:59] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-20 15:34:59] [stdout] 产物扫描完成：1 个文件入库
[2026-11-20 15:34:59] [stdout] 构建成功
[2026-11-20 15:34:59] [stdout] 退出码 0 · 耗时 1186ms
', 0, NULL, '3d7367e4-bac8-41d7-99f1-94ed0a427659', 1795160098470, NULL);
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('bfa661ac-572d-443d-a12b-a4a1eb997020', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 14, '1.0.0', 14, '6342c4e5c8fba239523a5a6d300f15f23c32eaef', 'failed', 11, 1795390417379, 1795390418176, 797, 127, '构建脚本退出码 127', '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/bfa661ac-572d-443d-a12b-a4a1eb997020.log', 1165, '[2026-11-23 07:33:37] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-23 07:33:37] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-23 07:33:37] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-23 07:33:37] [stdout] 合并提交 6342c4e5c8fba239523a5a6d300f15f23c32eaef
[2026-11-23 07:33:37] [stdout] 构建脚本 ./build_app
[2026-11-23 07:33:37] [stdout] 检查工作区，必要时克隆仓库
[2026-11-23 07:33:37] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-23 07:33:37] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-23 07:33:37] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=14 BUILD_NUMBER=14 CHANNEL=googleplay
[2026-11-23 07:33:37] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-23 07:33:37] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-23 07:33:38] [stderr] bash: ./build_app: No such file or directory
[2026-11-23 07:33:38] [stderr] 构建失败：构建脚本退出码 127
[2026-11-23 07:33:38] [stdout] 退出码 127 · 耗时 797ms
', 0, NULL, 'u3', 1795390417376, 'googleplay');
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('5614e1c7-6d0b-41e9-9395-2a79f9abc467', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 15, '1.0.0', 15, '1faf6b685368a54c76493813f4bdaed8604e771f', 'success', 100, 1795391057264, 1795391058129, 865, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/5614e1c7-6d0b-41e9-9395-2a79f9abc467.log', 1465, '[2026-11-23 07:44:17] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-23 07:44:17] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-23 07:44:17] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-23 07:44:17] [stdout] 合并提交 1faf6b685368a54c76493813f4bdaed8604e771f
[2026-11-23 07:44:17] [stdout] 构建脚本 set -e
# 模拟：把平台 download 下的 apk 拷到 build；真实项目请删除 DOWNLOAD_DIR 相关行
DOWNLOAD_DIR="$(cd ../.. && pwd)/download"
mkdir -p build
if [ -d "$DOWNLOAD_DIR" ]; then
  find "$DOWNLOAD_DIR" -type f -name ''*.apk'' -exec cp -f {} build/ \;
fi
[2026-11-23 07:44:17] [stdout] 检查工作区，必要时克隆仓库
[2026-11-23 07:44:17] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-23 07:44:17] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-23 07:44:17] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=15 BUILD_NUMBER=15 CHANNEL=googleplay
[2026-11-23 07:44:17] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-23 07:44:17] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-23 07:44:18] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-23 07:44:18] [stdout] 产物扫描完成：1 个文件入库
[2026-11-23 07:44:18] [stdout] 构建成功
[2026-11-23 07:44:18] [stdout] 退出码 0 · 耗时 865ms
', 0, NULL, 'u3', 1795391057260, 'googleplay');
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('0e9a807b-e4b9-439f-b1e9-8a7533805cdf', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 16, '1.0.0', 16, '1faf6b685368a54c76493813f4bdaed8604e771f', 'success', 100, 1795391222726, 1795391223833, 1107, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/0e9a807b-e4b9-439f-b1e9-8a7533805cdf.log', 1242, '[2026-11-23 07:47:02] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-23 07:47:02] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-23 07:47:02] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-23 07:47:02] [stdout] 合并提交 1faf6b685368a54c76493813f4bdaed8604e771f
[2026-11-23 07:47:02] [stdout] 构建脚本 ./build_app
[2026-11-23 07:47:02] [stdout] 检查工作区，必要时克隆仓库
[2026-11-23 07:47:02] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-23 07:47:02] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-23 07:47:02] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=16 BUILD_NUMBER=16 CHANNEL=googleplay
[2026-11-23 07:47:02] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-23 07:47:02] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-23 07:47:03] [stdout] 123
[2026-11-23 07:47:03] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-23 07:47:03] [stdout] 产物扫描完成：0 个文件入库
[2026-11-23 07:47:03] [stdout] 构建成功
[2026-11-23 07:47:03] [stdout] 退出码 0 · 耗时 1107ms
', 0, NULL, 'u3', 1795391222722, 'googleplay');
INSERT INTO "builds" ("id", "pipeline_id", "stage", "build_number", "version_name", "version_code", "merge_sha", "status", "progress", "started_at", "finished_at", "duration_ms", "exit_code", "fail_reason", "log_path", "log_size_bytes", "log_tail", "log_truncated", "log_deleted_at", "triggered_by", "created_at", "channel") VALUES ('c4d6c02d-6ba0-4b67-a688-dee9ea571a2b', '1ca53ab5-1293-46be-909f-4d22244a1565', 'qa', 17, '1.0.0', 17, '2a8bfaa13e0833aa493c28e07ad015daf1b3e2d6', 'success', 100, 1795391508283, 1795391509626, 1343, 0, NULL, '/Users/jd/Documents/GitHub/app_cli/storage/logs/b62905f4-22ef-4cf5-9715-2f8dcf297d53/c4d6c02d-6ba0-4b67-a688-dee9ea571a2b.log', 1242, '[2026-11-23 07:51:48] [stdout] 构建开始 · 流水 出行 App · apk · 阶段 QA
[2026-11-23 07:51:48] [stdout] 工作目录 workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-23 07:51:48] [stdout] Feature 分支 feature/task-7ef5fe2e
[2026-11-23 07:51:48] [stdout] 合并提交 2a8bfaa13e0833aa493c28e07ad015daf1b3e2d6
[2026-11-23 07:51:48] [stdout] 构建脚本 ./build_app
[2026-11-23 07:51:48] [stdout] 检查工作区，必要时克隆仓库
[2026-11-23 07:51:48] [stdout] 执行模式：真实构建（本地 workspace）
[2026-11-23 07:51:48] [stdout] 工作区 /Users/jd/Documents/GitHub/app_cli/workspace/b62905f4-22ef-4cf5-9715-2f8dcf297d53
[2026-11-23 07:51:48] [stdout] 构建参数：VERSION_NAME=1.0.0 VERSION_CODE=17 BUILD_NUMBER=17 CHANNEL=googleplay
[2026-11-23 07:51:48] [stdout] 分支参数：STAGE=qa FEATURE_BRANCH=feature/task-7ef5fe2e TARGET_BRANCH=qa
[2026-11-23 07:51:48] [stdout] 需求/任务：REQ-1046 / 接口开发
[2026-11-23 07:51:49] [stdout] 123
[2026-11-23 07:51:49] [stdout] 构建脚本执行成功，开始扫描产物
[2026-11-23 07:51:49] [stdout] 产物扫描完成：1 个文件入库
[2026-11-23 07:51:49] [stdout] 构建成功
[2026-11-23 07:51:49] [stdout] 退出码 0 · 耗时 1343ms
', 0, NULL, 'u3', 1795391508281, 'googleplay');

-- artifacts: 6 rows
INSERT INTO "artifacts" ("id", "build_id", "original_name", "display_name", "type", "mime_type", "size_bytes", "sha256", "relative_path", "status", "download_count", "last_downloaded_at", "created_at", "deleted_at") VALUES ('0980de40-6570-46dd-99be-2b6b92fa2bad', '7b5fb9bd-7893-47ad-a856-0ba662e74905', 'com_travel_overseas_app_release_20261120_142115_3a5a745.apk', 'com_travel_overseas_app_release_20261120_142115_3a5a745.apk', 'apk', 'application/vnd.android.package-archive', 183, 'b71a187687bcc449881704e05f22c6b4ffde76f1b5ef5a5e943336f530b3d716', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53/7b5fb9bd-7893-47ad-a856-0ba662e74905/com_travel_overseas_app_release_20261120_142115_3a5a745.apk', 'available', 1, 1795155677327, 1795155675165, NULL);
INSERT INTO "artifacts" ("id", "build_id", "original_name", "display_name", "type", "mime_type", "size_bytes", "sha256", "relative_path", "status", "download_count", "last_downloaded_at", "created_at", "deleted_at") VALUES ('f58d437c-c062-4ff0-a561-6e604f549c91', '533f31ab-4687-4d38-9f34-4574995fc85d', 'com_travel_overseas_app_qa_20261120_144330_194068f.apk', 'com_travel_overseas_app_qa_20261120_144330_194068f.apk', 'apk', 'application/vnd.android.package-archive', 178, 'f0592d1d05bb9c65a26e8a1d5f31a93a7d68581c3a803ef07de42408ee86c956', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53/533f31ab-4687-4d38-9f34-4574995fc85d/com_travel_overseas_app_qa_20261120_144330_194068f.apk', 'missing', 1, 1795159568036, 1795157010996, NULL);
INSERT INTO "artifacts" ("id", "build_id", "original_name", "display_name", "type", "mime_type", "size_bytes", "sha256", "relative_path", "status", "download_count", "last_downloaded_at", "created_at", "deleted_at") VALUES ('0e2c43f4-ffad-4488-bb77-80edf4f386bd', 'f97cb0b2-b02e-4b45-9c62-dc1e50a79ee6', '1.apk', 'com_travel_overseas_app_qa_20261120_153357_1bd7629.apk', 'apk', 'application/vnd.android.package-archive', 26915791, '1f977fd291f170e588b08dcb946b7a9ed6dfc08517bef602a01fe43f0a2177e2', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53/f97cb0b2-b02e-4b45-9c62-dc1e50a79ee6/com_travel_overseas_app_qa_20261120_153357_1bd7629.apk', 'available', 1, 1795160045118, 1795160037861, NULL);
INSERT INTO "artifacts" ("id", "build_id", "original_name", "display_name", "type", "mime_type", "size_bytes", "sha256", "relative_path", "status", "download_count", "last_downloaded_at", "created_at", "deleted_at") VALUES ('69a70076-2e67-4108-9c14-5c7a976630c3', '0c3afb5e-47a0-4303-869b-d02bf4f11d9b', '1.apk', 'com_travel_overseas_app_qa_20261120_153459_1bd7629.apk', 'apk', 'application/vnd.android.package-archive', 26915791, '1f977fd291f170e588b08dcb946b7a9ed6dfc08517bef602a01fe43f0a2177e2', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53/0c3afb5e-47a0-4303-869b-d02bf4f11d9b/com_travel_overseas_app_qa_20261120_153459_1bd7629.apk', 'available', 1, 1795160124708, 1795160099658, NULL);
INSERT INTO "artifacts" ("id", "build_id", "original_name", "display_name", "type", "mime_type", "size_bytes", "sha256", "relative_path", "status", "download_count", "last_downloaded_at", "created_at", "deleted_at") VALUES ('01556e99-f29c-4fca-aeb3-dd6ff97793e6', '5614e1c7-6d0b-41e9-9395-2a79f9abc467', '1.apk', 'com_travel_overseas_app_qa_20261123_074418_1faf6b6.apk', 'apk', 'application/vnd.android.package-archive', 26915791, '1f977fd291f170e588b08dcb946b7a9ed6dfc08517bef602a01fe43f0a2177e2', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53/5614e1c7-6d0b-41e9-9395-2a79f9abc467/com_travel_overseas_app_qa_20261123_074418_1faf6b6.apk', 'available', 0, NULL, 1795391058128, NULL);
INSERT INTO "artifacts" ("id", "build_id", "original_name", "display_name", "type", "mime_type", "size_bytes", "sha256", "relative_path", "status", "download_count", "last_downloaded_at", "created_at", "deleted_at") VALUES ('72af727c-56ab-4c8e-aeee-3a16e751b966', 'c4d6c02d-6ba0-4b67-a688-dee9ea571a2b', '1.apk', 'com_travel_overseas_app_qa_20261123_075149_2a8bfaa.apk', 'apk', 'application/vnd.android.package-archive', 26915791, '1f977fd291f170e588b08dcb946b7a9ed6dfc08517bef602a01fe43f0a2177e2', 'b62905f4-22ef-4cf5-9715-2f8dcf297d53/c4d6c02d-6ba0-4b67-a688-dee9ea571a2b/com_travel_overseas_app_qa_20261123_075149_2a8bfaa.apk', 'available', 0, NULL, 1795391509625, NULL);

-- audit_logs: 0 rows
