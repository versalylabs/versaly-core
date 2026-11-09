"use client";

import { WorkspaceLayout } from "@/components/workspace/workspace-layout";
import { useReserves } from "@/components/reserves-page/use-reserves";
import { ReservesToast } from "@/components/reserves-page/reserves-toast";
import { ReservesHeader } from "@/components/reserves-page/reserves-header";
import { SafeguardBanner } from "@/components/reserves-page/safeguard-banner";
import { VaultCards } from "@/components/reserves-page/vault-cards";
import { ReserveProgress } from "@/components/reserves-page/reserve-progress";
import { FundsGrid } from "@/components/reserves-page/funds-grid";
import { TransferModal } from "@/components/reserves-page/transfer-modal";
import { FundModal } from "@/components/reserves-page/fund-modal";
import { AccountsModal } from "@/components/reserves-page/accounts-modal";

export default function CashReservesPage() {
  const d = useReserves();

  return (
    <WorkspaceLayout>
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-8">
        <ReservesToast d={d} />
        <ReservesHeader d={d} />
        <SafeguardBanner />
        <VaultCards d={d} />
        <ReserveProgress d={d} />
        <FundsGrid d={d} />
        <TransferModal d={d} />
        <FundModal d={d} />
        <AccountsModal d={d} />
      </div>
    </WorkspaceLayout>
  );
}
