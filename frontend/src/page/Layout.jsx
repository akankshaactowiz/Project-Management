import { Outlet, useLocation, useOutletContext } from "react-router-dom";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Footer from "../components/Footer";

function Layout() {
  const location = useLocation();
  const outletContext = useOutletContext(); // receive context from page
  const { feedName } = outletContext || {};  // optional chaining

  // Disable global breadcrumb only on FeedDetails and Users pages
  const hideBreadcrumb =
    location.pathname.startsWith("/feed/") ||
    location.pathname.startsWith("/users/");

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header (sticky inside, with fixed height) */}
      <Header />

      {/* Main content wrapper */}
      <main className="flex-1 bg-gray-50 overflow-auto sm:p-2">
        {!hideBreadcrumb && <Breadcrumb feedName={feedName} />}
        <div className="w-full bg-white">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Layout;
