import { ConflictError, NotFoundError } from "@/lib/server/errors";
import { WorkspaceStorage } from "@/domain/workspace/storage/workspace.storage";

type Workspace = NonNullable<
  Awaited<ReturnType<WorkspaceStorage["findUserWorkspace"]>>
>;
type WorkspaceMembers = Awaited<ReturnType<WorkspaceStorage["findMembers"]>>;

export interface WorkspaceStoragePort {
  findUserWorkspace: WorkspaceStorage["findUserWorkspace"];
  createWorkspace: WorkspaceStorage["createWorkspace"];
  addMember: WorkspaceStorage["addMember"];
  findMembers: WorkspaceStorage["findMembers"];
}

export class WorkspaceService {
  constructor(private storage: WorkspaceStoragePort) {}

  async getMyWorkspace(userId: number): Promise<Workspace> {
    const workspace = await this.storage.findUserWorkspace(userId);
    if (!workspace) {
      throw new NotFoundError("NOT_FOUND");
    }
    return workspace;
  }

  async createWorkspace(userId: number, name: string): Promise<Workspace> {
    const existing = await this.storage.findUserWorkspace(userId);
    if (existing) {
      throw new ConflictError("ALREADY_IN_WORKSPACE");
    }

    const workspace = await this.storage.createWorkspace(name);
    await this.storage.addMember(workspace.id, userId, "ADMIN");
    return workspace;
  }

  async joinWorkspace(workspaceId: number, userId: number): Promise<void> {
    const existing = await this.storage.findUserWorkspace(userId);
    if (existing) {
      throw new ConflictError("ALREADY_IN_WORKSPACE");
    }

    await this.storage.addMember(workspaceId, userId, "MEMBER");
  }

  async getMembers(workspaceId: number): Promise<WorkspaceMembers> {
    return await this.storage.findMembers(workspaceId);
  }
}
