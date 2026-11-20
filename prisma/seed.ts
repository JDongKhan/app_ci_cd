import { PrismaClient } from "@prisma/client";
import { DEFAULT_PERMISSIONS } from "../apps/api/src/roles/default-permissions";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "Init@123";

const users = [
  { id: "u1", account: "chenmo", name: "陈默", role: "dev", level: "l3", team: "出行 App 组" },
  { id: "u2", account: "linxiao", name: "林晓", role: "qa", level: "l2", team: "质量保障组" },
  { id: "u3", account: "wangqiang", name: "王强", role: "admin", level: null, team: "研发效能" },
  { id: "u4", account: "suqing", name: "苏晴", role: "pm", level: "l1", team: "海外产品" },
  { id: "u5", account: "zhouran", name: "周然", role: "dev", level: "l2", team: "商家工作台" }
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const user of users) {
    await prisma.user.upsert({
      where: { account: user.account },
      update: {
        name: user.name,
        role: user.role,
        level: user.level,
        team: user.team,
        active: true
      },
      create: {
        ...user,
        passwordHash
      }
    });
  }

  await prisma.rolePermission.deleteMany();

  for (const [key, permissions] of Object.entries(DEFAULT_PERMISSIONS)) {
    const [role, level] = key.split("/");
    for (const permissionKey of permissions) {
      await prisma.rolePermission.create({
        data: { role, level, permissionKey }
      });
    }
  }

  console.log(`Seeded ${users.length} users and ${Object.keys(DEFAULT_PERMISSIONS).length} role-level permission sets.`);
  console.log(`Demo password: ${DEMO_PASSWORD}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
