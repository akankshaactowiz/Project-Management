import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";


function Breadcrumb({ feedName, projectId: propProjectId }) {
  const location = useLocation();
  const { id: feedId } = useParams(); // feed ID from /projects/feed/:id
  const [projectId, setProjectId] = useState(propProjectId || "");

  // ✅ Fetch projectId if not passed as prop
  useEffect(() => {
    if (!projectId && feedId) {
      const fetchProjectId = async () => {
        try {
          const res = await fetch(
            `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${feedId}`,
            { credentials: "include" }
          );
          if (!res.ok) return;
          const data = await res.json();

          // ✅ Extract projectId._id if it's an object
          if (data?.projectId?._id) {
            setProjectId(data.projectId._id);
          } else if (typeof data?.projectId === "string") {
            setProjectId(data.projectId);
          }
        } catch (err) {
          console.error("Failed to fetch projectId for breadcrumb", err);
        }
      };
      fetchProjectId();
    }
  }, [feedId, projectId]);

  const pathnames = location.pathname.split("/").filter(Boolean);
  if (location.pathname === "/" || location.pathname === "/home") return null;

  // Remove dynamic IDs from breadcrumb
  const filteredPathnames = pathnames.filter(
    (segment) => !/^[0-9a-fA-F]{5,}$/.test(segment)
  );

  // Enhanced pathnames
  const enhancedPathnames = [...filteredPathnames];

  // ✅ If on feed page, insert "details" before "feed"
  const feedIndex = enhancedPathnames.findIndex(
    (seg) => seg.toLowerCase() === "feed"
  );
  if (feedIndex > 0 && !enhancedPathnames.includes("details")) {
    enhancedPathnames.splice(feedIndex, 0, "details");
  }

  return (
    <nav
      aria-label="breadcrumb"
      className="bg-gray-100 rounded-lg mb-2 px-2 py-2 text-md text-gray-600"
    >
      <ol className="list-none p-0 inline-flex space-x-2">
        <li>
          <Link to="/home" className="hover:text-purple-700">
            Home
          </Link>
     
        </li>

        {enhancedPathnames.map((value, index) => {
          const isLast = index === enhancedPathnames.length - 1;
          let to = null;

          // ✅ Build proper routes
          if (value.toLowerCase() === "projects") {
            to = "/projects";
          //  to = `/projects?fromUpdateModal=true&projectId=${projectId}`;
            // to = { pathname: "/projects", state: { fromUpdateModal: true, projectId } };
          } else if (value.toLowerCase() === "details" && projectId) {
            to = `/projects/${projectId}/details`;
          } else if (value.toLowerCase() === "feed" && feedId) {
            to = `/projects/feed/${feedId}`;
          } else {
            to = `/${enhancedPathnames.slice(0, index + 1).join("/")}`;
          }

          const displayName = isLast && feedName ? feedName : value;

          return (
            <li key={index} className="flex items-center">
              <span className="mx-2 text-gray-400">{">"}</span>
              {isLast ? (
                <span className="text-gray-900 font-semibold capitalize">
                  {displayName.replace(/-/g, " ")}
                </span>
              ) : (
                <Link to={to} className="hover:text-purple-700 capitalize">
                  {displayName.replace(/-/g, " ")}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
