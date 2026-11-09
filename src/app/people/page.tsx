"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { usePeople } from "@/components/people-page/use-people";
import { PeopleHeader } from "@/components/people-page/people-header";
import { PeopleToast } from "@/components/people-page/people-toast";
import { PeopleFilterBar } from "@/components/people-page/people-filter-bar";
import { PeopleList } from "@/components/people-page/people-list";
import { StakeholderModal } from "@/components/people-page/stakeholder-modal";
import { DeletePersonModal } from "@/components/people-page/delete-person-modal";

export default function PeoplePage() {
  const d = usePeople();

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <PeopleHeader d={d} />
        <PeopleToast d={d} />
        <PeopleFilterBar d={d} />
        <PeopleList d={d} />
        <StakeholderModal d={d} />
        <DeletePersonModal d={d} />
      </div>
    </WorkspaceLayout>
  );
}
