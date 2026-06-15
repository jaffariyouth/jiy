import { DashboardProvider } from "./DashboardContext";
import { ToastPortal } from "./ToastPortal";
import { TopNavBar } from "./TopNavBar";
import { SponsorNotice } from "./SponsorNotice";
import { WelcomeBlock } from "./WelcomeBlock";
import { UpcomingEvents } from "./UpcomingEvents";
import { StructuralDivider } from "./StructuralDivider";
import { EditorialJournalFeed } from "./EditorialJournalFeed";
import { RegistrationTicket } from "./RegistrationTicket";
import { AnnouncementsWidget } from "./AnnouncementsWidget";
import { VolunteerCorpWidget } from "./VolunteerCorpWidget";
import { AssociationLinks } from "./AssociationLinks";
import { GeometricOrnament } from "./GeometricOrnament";
import { DashboardFooter } from "./DashboardFooter";
import { SponsorModal } from "./SponsorModal";

export function DashboardShell() {
  return (
    <DashboardProvider>
      <div className="jiy-dashboard min-h-screen flex flex-col">
        <ToastPortal />
        <TopNavBar />
        <SponsorNotice />

        <main className="max-w-[1280px] mx-auto px-10 py-12 grow w-full">
          <WelcomeBlock />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 flex flex-col gap-10">
              <UpcomingEvents />
              <StructuralDivider />
              <EditorialJournalFeed />
            </div>

            <div className="lg:col-span-4 flex flex-col gap-8">
              <RegistrationTicket />
              <AnnouncementsWidget />
              <VolunteerCorpWidget />
              <AssociationLinks />
            </div>
          </div>

          <GeometricOrnament />
        </main>

        <DashboardFooter />
        <SponsorModal />
      </div>
    </DashboardProvider>
  );
}
