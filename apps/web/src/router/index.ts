import { createRouter, createWebHashHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import AppLayout from "@/layouts/AppLayout.vue";
import LoginView from "@/views/LoginView.vue";
import HomeView from "@/views/HomeView.vue";
import RolesView from "@/views/RolesView.vue";
import StaffView from "@/views/StaffView.vue";
import AppsView from "@/views/AppsView.vue";
import ArtifactsView from "@/views/ArtifactsView.vue";
import BoardView from "@/views/BoardView.vue";
import ReqsView from "@/views/ReqsView.vue";
import ReqDetailView from "@/views/ReqDetailView.vue";
import TaskDetailView from "@/views/TaskDetailView.vue";
import PlaceholderView from "@/views/PlaceholderView.vue";
import ForbiddenView from "@/views/ForbiddenView.vue";

const router = createRouter({
  // 静态托管不支持 SPA 重写，使用 hash 路由保证子路由刷新/直链可用
  history: createWebHashHistory(),
  routes: [
    {
      path: "/login",
      name: "login",
      component: LoginView,
      meta: { title: "登录" }
    },
    {
      path: "/403",
      name: "forbidden",
      component: ForbiddenView,
      meta: { title: "无权限" }
    },
    {
      path: "/",
      component: AppLayout,
      children: [
        {
          path: "",
          name: "home",
          component: HomeView,
          meta: { title: "首页 · 我的任务", description: "账号、权限与当前工作台", permission: "home" }
        },
        {
          path: "board",
          name: "board",
          component: BoardView,
          meta: { title: "任务看板", description: "按任务状态查看交付进展", permission: "board" }
        },
        {
          path: "reqs",
          name: "reqs",
          component: ReqsView,
          meta: { title: "需求管理", description: "需求、负责人和任务拆分", permission: "reqs" }
        },
        {
          path: "reqs/:id",
          name: "req-detail",
          component: ReqDetailView,
          meta: { title: "需求详情", description: "负责人、测试人员与任务", permission: "reqs" }
        },
        {
          path: "tasks/:id",
          name: "task-detail",
          component: TaskDetailView,
          meta: { title: "任务详情", description: "任务状态、CI 流水与构建记录" }
        },
        {
          path: "apps",
          name: "apps",
          component: AppsView,
          meta: { title: "应用配置", description: "仓库、分支、构建脚本与产物配置", permission: "apps" }
        },
        {
          path: "artifacts",
          name: "artifacts",
          component: ArtifactsView,
          meta: { title: "打包产物", description: "已入库、打包中与失败的构建", permission: "artifacts" }
        },
        {
          path: "roles",
          name: "roles",
          component: RolesView,
          meta: {
            title: "角色权限",
            description: "按角色 × 级别维护菜单权限矩阵",
            permission: "roles",
            adminOnly: true
          }
        },
        {
          path: "staff",
          name: "staff",
          component: StaffView,
          meta: {
            title: "人员管理",
            description: "账号、角色、级别、团队与启停",
            permission: "staff",
            adminOnly: true
          }
        },
        {
          path: "spec",
          name: "spec",
          component: PlaceholderView,
          meta: { title: "需求说明", description: "一期范围、三类状态与已确认规则", permission: "spec" }
        }
      ]
    }
  ]
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.path === "/login") {
    return auth.token ? { path: "/" } : true;
  }

  if (!auth.token) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  if (!auth.user) {
    try {
      await auth.loadMe();
    } catch {
      auth.logout();
      return { path: "/login", query: { redirect: to.fullPath } };
    }
  }

  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    return { path: "/403" };
  }

  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ShipFlow` : "ShipFlow";
});

export default router;
