import { Outlet } from "react-router-dom";
import { DashboardHeader } from "../DashboardHeader/DashboardHeader";

export const DashboardLayout = () => {
  return (
    <section>
      <DashboardHeader />
      <div>
        <Outlet />
      </div>
    </section>
  );
};
