import Navbar from "@/components/Navbar/Navbar";
import DashboardOrbs from "@/components/dashboard/DashboardOrbs";
import FormDrawer from "@/components/creator/FormDrawer";
import ToastContainer from "@/components/creator/shared/Toast";
import { DashboardProvider } from "@/context/DashboardContext";

export default function ReaderLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardOrbs />
      <Navbar variant="dashboard" />
      <div className="reader-spacer" />
      <main className="reader-main">
        {children}
      </main>
      <FormDrawer />
      <ToastContainer />
    </DashboardProvider>
  );
}
