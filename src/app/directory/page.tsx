"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useDirectory } from "@/components/directory-page/use-directory";
import { DirectoryHeader } from "@/components/directory-page/directory-header";
import { DirectoryControls } from "@/components/directory-page/directory-controls";
import { OrgFilters } from "@/components/directory-page/org-filters";
import { DirectorySplitView } from "@/components/directory-page/directory-split-view";
import { OrgModal } from "@/components/directory-page/org-modal";
import { DeleteOrgModal } from "@/components/directory-page/delete-org-modal";
import { EditNoteModal } from "@/components/directory-page/edit-note-modal";

export default function DirectoryPage() {
  const d = useDirectory();

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <DirectoryHeader d={d} />
        <DirectoryControls d={d} />
        <OrgFilters d={d} />
        <DirectorySplitView d={d} />
        <OrgModal d={d} />
        <DeleteOrgModal d={d} />
        <EditNoteModal d={d} />
      </div>
    </WorkspaceLayout>
  );
}
