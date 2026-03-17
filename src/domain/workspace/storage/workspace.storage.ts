import { getDb } from "@/db";
import { users, workspaceMembers, workspaces } from "@/db/schema";
import { and, eq } from "drizzle-orm";

type Db = ReturnType<typeof getDb>;
type Workspace = typeof workspaces.$inferSelect;
type WorkspaceMember = typeof workspaceMembers.$inferSelect;
type WorkspaceMemberWithUser = WorkspaceMember & {
  user: typeof users.$inferSelect;
};

export class WorkspaceStorage {
  constructor(private db: Db) {}

  async findUserWorkspace(userId: number): Promise<Workspace | null> {
    const member = await this.db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.userId, userId),
      with: {
        workspace: true,
      },
    });
    return member?.workspace || null;
  }

  async createWorkspace(name: string): Promise<Workspace> {
    const [newWorkspace] = await this.db
      .insert(workspaces)
      .values({ name })
      .returning();
    return newWorkspace;
  }

  async addMember(
    workspaceId: number,
    userId: number,
    role: "ADMIN" | "MEMBER",
  ): Promise<void> {
    await this.db.insert(workspaceMembers).values({
      workspaceId,
      userId,
      role,
    });
  }

  async findMembershipByUserId(userId: number): Promise<WorkspaceMember | null> {
    return await this.db.query.workspaceMembers.findFirst({
      where: eq(workspaceMembers.userId, userId),
    });
  }

  async findMembership(
    workspaceId: number,
    userId: number,
  ): Promise<WorkspaceMember | null> {
    return await this.db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId),
      ),
    });
  }

  async findMembers(workspaceId: number): Promise<WorkspaceMemberWithUser[]> {
    return await this.db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.workspaceId, workspaceId),
      with: {
        user: true,
      },
    });
  }
}
