import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function MainLayout() {
  return (
    <div>
      <div id="app-container" className="bg-white min-h-screen flex "  >
        {/* style={{ backgroundImage: `url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiYDPww5VIF5BjQL3ltrltGJZYgoUovjcChg&s')` }} */}
        <div id="layout-wrapper" className="flex flex-row flex-1">
          <Navbar />
          <div className="flex-1">
            <Outlet />
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}