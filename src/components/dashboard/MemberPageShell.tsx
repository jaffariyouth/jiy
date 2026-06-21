import type { ReactNode } from "react";
import { DashboardProvider } from "./DashboardContext";
import { ToastPortal } from "./ToastPortal";
import { TopNavBar } from "./TopNavBar";
import { SponsorNotice } from "./SponsorNotice";
import { DashboardFooter } from "./DashboardFooter";
import { SponsorModal } from "./SponsorModal";

export function MemberPageShell({ children }: { children: ReactNode }) {
  return (
    <DashboardProvider>
      <div className="jiy-dashboard min-h-screen flex flex-col bg-alabaster-parchment">
        <ToastPortal />
        <TopNavBar />
        <SponsorNotice />
        <main className="grow w-full">{children}</main>
        <DashboardFooter />
        <SponsorModal />
      </div>
    </DashboardProvider>
  );
}
