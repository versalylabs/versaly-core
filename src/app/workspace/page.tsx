"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useMyWorkspace } from "@/components/workspace-page/use-my-workspace";
import { WorkspaceToast } from "@/components/workspace-page/workspace-toast";
import { WorkspaceHeader } from "@/components/workspace-page/workspace-header";
import { StatusCards } from "@/components/workspace-page/status-cards";
import { WorkspaceTabs } from "@/components/workspace-page/workspace-tabs";
import { TasksTab } from "@/components/workspace-page/tasks-tab";
import { ProjectsTab } from "@/components/workspace-page/projects-tab";
import { FollowUpsTab } from "@/components/workspace-page/follow-ups-tab";
import { ApprovalsTab } from "@/components/workspace-page/approvals-tab";
import { TaskModal } from "@/components/workspace-page/task-modal";
import { ProjectModal } from "@/components/workspace-page/project-modal";
import { FollowUpModal } from "@/components/workspace-page/follow-up-modal";
import { ApprovalModal } from "@/components/workspace-page/approval-modal";
import { DeleteConfirmModal } from "@/components/workspace-page/delete-confirm-modal";

export default function MyWorkspacePage() {
  const d = useMyWorkspace();

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <WorkspaceToast d={d} />
        <WorkspaceHeader />
        <StatusCards d={d} />
        <WorkspaceTabs d={d} />
        <TasksTab d={d} />
        <ProjectsTab d={d} />
        <FollowUpsTab d={d} />
        <ApprovalsTab d={d} />
      </div>
      <TaskModal d={d} />
      <ProjectModal d={d} />
      <FollowUpModal d={d} />
      <ApprovalModal d={d} />
      <DeleteConfirmModal d={d} />
    </WorkspaceLayout>
  );
}
