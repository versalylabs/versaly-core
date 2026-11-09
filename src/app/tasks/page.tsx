"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useTasks } from "@/components/tasks/use-tasks";
import { TasksHeader } from "@/components/tasks/tasks-header";
import { ResetInfoCard } from "@/components/tasks/reset-info-card";
import { TasksToast } from "@/components/tasks/tasks-toast";
import { TasksTabs } from "@/components/tasks/tasks-tabs";
import { DailyQueueTab } from "@/components/tasks/daily-queue-tab";
import { WeeklyRhythmTab } from "@/components/tasks/weekly-rhythm-tab";
import { RoadmapTab } from "@/components/tasks/roadmap-tab";
import { ActionModal } from "@/components/tasks/action-modal";
import { DeleteActionModal } from "@/components/tasks/delete-action-modal";
import { RoadmapDayModal } from "@/components/tasks/roadmap-day-modal";
import { DeleteRoadmapDayModal } from "@/components/tasks/delete-roadmap-day-modal";
import { RhythmModal } from "@/components/tasks/rhythm-modal";

export default function TasksPage() {
  const d = useTasks();

  return (
    <WorkspaceLayout>
      <div className="space-y-6">
        <TasksHeader d={d} />
        <ResetInfoCard d={d} />
        <TasksToast d={d} />
        <TasksTabs d={d} />
        <DailyQueueTab d={d} />
        <WeeklyRhythmTab d={d} />
        <RoadmapTab d={d} />
        <ActionModal d={d} />
        <DeleteActionModal d={d} />
        <RoadmapDayModal d={d} />
        <DeleteRoadmapDayModal d={d} />
        <RhythmModal d={d} />
      </div>
    </WorkspaceLayout>
  );
}
