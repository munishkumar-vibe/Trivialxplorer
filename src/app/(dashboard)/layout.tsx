import Navbar from "@/components/Navbar/Navbar";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardOrbs from "@/components/dashboard/DashboardOrbs";
import BottomNav from "@/components/dashboard/BottomNav";
import FormDrawer from "@/components/creator/FormDrawer";
import ToastContainer from "@/components/creator/shared/Toast";
import { DashboardProvider } from "@/context/DashboardContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <div className="dashboard-root">
        <DashboardOrbs />
        <Navbar variant="dashboard" />
        <div className="dashboard-nav-spacer" />
        <div className="dashboard-body">
          <Sidebar />
          <main className="dashboard-main">
            {children}
          </main>
        </div>
        <BottomNav />
        <FormDrawer />
        <ToastContainer />
      </div>
    </DashboardProvider>
  );
}
