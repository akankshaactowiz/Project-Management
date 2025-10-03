import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaFilePdf, FaFileCsv } from "react-icons/fa6";
import { RiFileExcel2Fill } from "react-icons/ri";
import { LuFileJson } from "react-icons/lu";
import { FaEdit } from "react-icons/fa";

import Breadcrumb from "../components/Breadcrumb";
import Pagination from "../components/Pagination";
import Img from "../assets/no-data-found.svg";
import { exportData } from "../utils/exportUtils";

export default function FeedDetails() {
  const { id } = useParams();
  const [feed, setFeed] = useState(null);
  const [activeTab, setActiveTab] = useState("Feed Log");
  const [entries, setEntries] = useState(25);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [dataRows, setDataRows] = useState([]);
  // const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const tabs = ["Feed Log", "Auto QA Rules", "Last Approved Sample File"];
  const navigate = useNavigate();

  // Fetch feed details
  // useEffect(() => {
  //   const fetchFeed = async () => {
  //     try {
  //       setLoading(true);
  //       const res = await fetch(
  //         `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
  //         {
  //           credentials: "include",
  //         }
  //       );
  //       const data = await res.json();

  //       // Handle non-breaking space key
  //       const feedKey = Object.keys(data).find(
  //         (k) => k.replace(/\s/g, "").toLowerCase() === "feedname"
  //       );
  //       const projectKey = Object.keys(data).find(
  //         (k) => k.replace(/\s/g, "").toLowerCase() === "projectname"
  //       );

  //       setFeed({
  //         ...data,
  //         feedName: data[feedKey],
  //         projectName: data[projectKey],
  //       });
  //     } catch (err) {
  //       console.error("Error fetching feed:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchFeed();
  // }, [id]);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();

        // Map feed & project data
        const project = data.projectId || {};
        setFeed({
          feedId: data.FeedId || "-",
          feedName: data.FeedName || "-",
          // domainName: data.DomainName || "-",
          // applicationType: data.ApplicationType || "-",
          // countryName: data.CountryName || "-",
          platform : data.Platform || "-",
          status: data.Status || "-",
          BAUStatus: data.BAUStatus || "-",
          POC: data.POC || "-",
          PCId: data.PCId || "-",
          TLId: data.TLId || "-",
          QAId: data.QAId || "-",
          BAUPersonId: data.BAUPersonId || "-",
          Frequency: data.Frequency || "-",
          DeliveryStatus: data.DeliveryType,
          StartTime: data.StartTime,
          DeliveryTime: data.DeliveryTime,
          DeliveryCode: data.DeliveryCode,
          FilePath: data.FilePath,
          projectCode: project.ProjectCode || "-",
          projectName: project.ProjectName || "-",
          frequency: project.Frequency || "-",
          deliveryType: project.DeliveryType || "-",
          industryType: project.IndustryType || "-",
          frameworkType: data.FrameworkType || "-",
          manageBy: project.ManageBy || "-",
          qaRules: project.QARules ?? "-",
          rulesStatus: project.RulesStatus || "-",
          rulesApply: project.RulesApply || "-",
          dbStatus: project.DBStatus || "-",
          projectStatus: project.Status || "-",
          assignedBy: project.CreatedBy || "-",
          createdDate: project.CreatedDate || "-",
          developerIds: project.DeveloperIds || [],


        });
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [id]);



  // const columns = [
  //   "Timestamp",
  //   "Status",
  //   "Message",
  //   "Processed Records",
  //   "Failed Records",
  //   "Duration",
  //   "Executed By",
  // ];

  const columns = [
    "No.",
    "Delivery Status",
    "Start Time",
    "Delivery Time",
    "Delivery Code",
    "File Path",
    // "Frequency",
    // "POC"

  ]
  return (
    <>
    
    <div className="px-4 pt-2">

      <div className="flex items-center justify-between mt-4">
    {/* Heading */}
    <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
      Feed Details
    </h2>
</div>
      {/* <div className="flex bg-gray-50 items-center justify-end px-2">
        <Breadcrumb feedName={feed?.feedName} />
        <button
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded cursor-pointer"
          onClick={() => navigate(`/feed/${id}/update`)}
        >
          <FaEdit size={18} />
          <span>Edit</span>
        </button>
      </div> */}

      {/* Top summary card */}
      {/* 
      {loading ? (
        <>
          <div className="flex justify-center items-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-blue-600 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          </div>
        </>
      ) : (
        feed && (
          <div className="bg-white rounded-lg shadow p-6 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
                {feed?.projectName || "Feed Details"}
              </h3>
              <button
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded cursor-pointer"
                onClick={() => navigate(`/project/feed/${id}/update`)}
              >
                <FaEdit size={18} />
                <span>Edit</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-500">Feed Name:</p>
                <p className="font-semibold">{feed.FeedName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Feed Id:</p>
                <p className="font-semibold">{feed["FeedId"]}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Platform:</p>
                <p className="font-semibold">{feed.Platform}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">PM:</p>
                <p className="font-semibold">{feed.PM}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Developer:</p>
                <p className="font-semibold">{feed.Developer}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">BAU:</p>
                <p className="font-semibold">{feed.BAU}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">QA:</p>
                <p className="font-semibold">{feed.QA}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rules Status:</p>
                <p className="font-semibold">{feed["Rules Status"]}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Rules Apply On:</p>
                <p className="font-semibold">{feed["Rules Apply"]}</p>
              </div>
            </div>
          </div>
        )
      )} */}

      <div className="bg-white rounded-lg shadow p-6 mt-4">
        {/* Project Title */}
        <h3 className="mb-4 text-lg font-bold">
          {feed?.feedName || "Feed Details"}
        </h3>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SIDE (Tabs + Summary/Feeds) */}
          {/* <div className="lg:col-span-3 min-w-0">
           
            <div className="flex gap-2 mb-4 bg-gray-100 p-2 rounded-sm">
              <button
                className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white"

              >
                Feed Deliveries
              </button>

            </div>


            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-100 shadow overflow-hidden">
                <thead className="bg-gray-100 text-gray-700 sticky top-0">
                  <tr>
                    {columns.map((col) => (
                      <th
                        key={col}
                        className="px-3 py-2 text-left font-semibold whitespace-nowrap"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="bg-white">
                  
                  {feed && feed.DeliveryCode ? (
                    <tr className="border-t">
                      <td className="px-4 py-2"></td>
                      <td className="px-4 py-2">{feed.DeliveryStatus}</td>
                      <td className="px-4 py-2">{feed.StartTime}</td>
                      <td className="px-4 py-2">{feed.DeliveryTime}</td>
                      <td className="px-4 py-2">{feed.DeliveryCode}</td>
                      <td className="px-4 py-2">{feed.FilePath}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td colSpan={14} className="text-center p-8 text-gray-500">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <img
                            src={Img}
                            alt="No data"
                            className="w-32 h-32 object-contain opacity-80"
                          />
                          <p className="font-semibold text-lg text-gray-600">No Data Found</p>
                          <p className="text-sm text-gray-400">
                            Try adding new projects to see them here.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}

                </tbody>
              </table>
            </div>


          </div> */}

          {/* RIGHT SIDE (Always visible Project Details) */}
          <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">

            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 m-0">
                <span className="w-2 h-6 bg-blue-500 rounded"></span>
                Feed Details
              </h4>

              <button
                className="flex items-center gap-2 text-white px-3 py-1 rounded cursor-pointer bg-purple-600 hover:bg-purple-700"
                onClick={() => navigate(`/projects/feed/${id}/update`)}
              >
                <FaEdit size={16} />
                <span>Edit</span>
              </button>
            </div>
            
<hr className="border-gray-200 mb-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                { label: "Feed ID", value: feed?.feedId },
                { label: "Project", value: `${feed?.projectCode} ${feed?.projectName}` },
                { label: "Frequency", value: feed?.frequency, badge: true },
                { label: "Platform", value: feed?.platform },
                { label: "Status", value: feed?.status, badgeColor: "blue" },
                { label: "BAU", value: feed?.BAUStatus },
                { label: "POC", value: feed?.POC },
                { label: "DB Status", value: feed?.dbStatus },
                { label: "Framework Type", value: feed?.frameworkType },
                { label: "Manage By", value: feed?.manageBy },
                { label: "QA Rules", value: feed?.qaRules },
                { label: "Rules Status", value: feed?.rulesStatus },
                { label: "Rules Apply", value: feed?.rulesApply },
                { label: "Delivery Type", value: feed?.deliveryType },
                { label: "Project Status", value: feed?.projectStatus },
                { label: "Industry", value: feed?.industryType },
                { label: "Assigned To", value: feed?.developerIds?.length ? feed.developerIds.join(", ") : "-" },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <span className="text-gray-500 w-32">{item.label}</span>
                  {item.badge ? (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {item.value}
                    </span>
                  ) : item.badgeColor === "blue" ? (
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-600">
                      {item.value}
                    </span>
                  ) : (
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
