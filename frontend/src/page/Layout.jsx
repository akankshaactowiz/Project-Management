import { Outlet, useLocation, useOutletContext, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import Breadcrumb from "../components/Breadcrumb";
import Footer from "../components/Footer";

function Layout() {
  const location = useLocation();
  const outletContext = useOutletContext();
  const { feedName: contextFeedName } = outletContext || {};
  const { id: feedIdParam } = useParams(); // feedId from /projects/feed/:feedId

  const [feedId, setFeedId] = useState(feedIdParam || "");
  const [projectId, setProjectId] = useState("");
  const [feedName, setFeedName] = useState(contextFeedName || "");

  const hideBreadcrumb = location.pathname.startsWith("/users/");

useEffect(() => {
  // update feedId from route if available
  if (feedIdParam && typeof feedIdParam !== "string") {
    setFeedId(String(feedIdParam));
  }

  const fetchProjectData = async () => {
    // If we are on feed details page
    if (location.pathname.startsWith("/projects/feed/") && feedId) {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${encodeURIComponent(String(feedId))}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (data?.projectId) {
          const idString =
            typeof data.projectId === "object"
              ? data.projectId._id || ""
              : String(data.projectId);
          setProjectId(idString);
        }

        if (data?.FeedName) setFeedName(data.FeedName);
      } catch (err) {
        console.error("Failed to fetch feed data:", err);
      }
    }
    // If we are on project details page
    else if (
      location.pathname.startsWith("/projects/") &&
      location.pathname.includes("/details")
    ) {
      const parts = location.pathname.split("/");
      const id = parts[2];
      if (id) setProjectId(String(id));
      setFeedName(""); // ✅ clear feed name when on project details
    }
    // ✅ If on /projects (or any non-feed route)
    else if (location.pathname === "/projects") {
      setFeedName("");
      setProjectId("");
    }
  };

  fetchProjectData();
}, [location.pathname, feedIdParam, feedId]);


  console.log("🧭 Layout Debug:", { feedId, projectId, location: location.pathname });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 overflow-auto sm:p-2">
        {!hideBreadcrumb && (
          <Breadcrumb feedName={feedName} projectId={projectId} />
        )}
        <div className="w-full bg-white">
          <Outlet context={{ feedName }} />
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Layout;
