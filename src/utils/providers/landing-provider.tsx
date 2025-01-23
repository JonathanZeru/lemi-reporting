import Footer from "@/components/footer/footer";
import { Outlet } from "react-router-dom";
const LandingLayout = ({ children }:any) => {
  return (
    <div className="app">
      <main className=" content">
        {children}
        <Outlet />
        <Footer />
      </main>
    </div>
  );
};

export default LandingLayout;
