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

  async findWorkspaceById(workspaceId: number): Promise<Workspace | null> {
    return await this.db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
    });
  }

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

  async updateWorkspaceName(
    workspaceId: number,
    name: string,
  ): Promise<Workspace | null> {
    const [updatedWorkspace] = await this.db
      .update(workspaces)
      .set({ name })
      .where(eq(workspaces.id, workspaceId))
      .returning();

    return updatedWorkspace ?? null;
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

  async findMembershipById(
    workspaceId: number,
    membershipId: number,
  ): Promise<WorkspaceMember | null> {
    return await this.db.query.workspaceMembers.findFirst({
      where: and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.id, membershipId),
      ),
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

  async removeMemberById(workspaceId: number, membershipId: number): Promise<void> {
    await this.db
      .delete(workspaceMembers)
      .where(
        and(
          eq(workspaceMembers.workspaceId, workspaceId),
          eq(workspaceMembers.id, membershipId),
        ),
      );
  }
}
