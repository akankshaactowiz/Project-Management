import { Link, useLocation } from "react-router-dom";

function Breadcrumb({ feedName }) {
  const location = useLocation();

  const pathnames = location.pathname
    .split("/")
    .filter((x) => x);

  if (location.pathname === "/" || location.pathname === "/home") {
    return null;
  }

  // Filter out dynamic IDs (numbers or long alphanumeric strings)
  // const filteredPathnames = pathnames.filter(
  //   (segment) => !/^[0-9a-fA-F]{5,}$/.test(segment)
  // );

  const filteredPathnames = pathnames.filter(
  (segment) => !/^[0-9a-fA-F]{5,}$/.test(segment) // skip IDs
);

  return (
    <nav aria-label="breadcrumb" className="bg-gray-50 px-6 py-2 text-gray-600">
      <ol className="list-none p-0 inline-flex space-x-2">
        <li>
          <Link to="/home" className="hover:text-purple-700">
            Home
          </Link>
        </li>
        {filteredPathnames.map((value, index) => {
          const to = `/${filteredPathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === filteredPathnames.length - 1;

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
