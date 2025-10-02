import { Link, useLocation, useParams } from "react-router-dom";

function Breadcrumb({ feedName }) {
  const location = useLocation();
  const { id } = useParams(); // ✅ Get feed id from URL (if present)

  const pathnames = location.pathname.split("/").filter((x) => x);

  if (location.pathname === "/" || location.pathname === "/home") {
    return null;
  }

  // Remove dynamic IDs from breadcrumb
  const filteredPathnames = pathnames.filter(
    (segment) => !/^[0-9a-fA-F]{5,}$/.test(segment)
  );

  return (
    <nav aria-label="breadcrumb" className="bg-gray-100 rounded-lg mb-2 px-2 py-2 text-md text-gray-600">
      <ol className="list-none p-0 inline-flex space-x-2">
        <li>
          <Link to="/home" className="hover:text-purple-700">
            Home
          </Link>
        </li>
        {filteredPathnames.map((value, index) => {
          let to = `/${filteredPathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === filteredPathnames.length - 1;

          // ✅ Special handling: if breadcrumb is "feed", attach the id
          if (value.toLowerCase() === "feed" && id) {
            to = `/projects/feed/${id}`;
          }

          // Use feedName if last breadcrumb
          const displayName = isLast && feedName ? feedName : value;

          return (
            <li key={to} className="flex items-center">
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
