import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { useAuth } from "../hooks/useAuth";



const FeedDetails = ({ allUsers }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {user} = useAuth();
  const [feed, setFeed] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch feed & project data
  useEffect(() => {
    const fetchFeed = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        const project = data.projectId || {};

        setFeed({
          feedId: data.FeedId || "-",
          feedName: data.FeedName || "-",
          platform: data.Platform || "-",
          status: data.Status || "-",
          BAUStatus: data.BAUStatus || "-",
          POC: data.POC || "-",
          PCId: data.PCId || "-",
          TLId: data.TLId || "-",
          QAId: data.QAId || null,
          BAUPersonId: data.BAUPersonId || null,
          Frequency: data.Frequency || "-",
          DeliveryStatus: data.DeliveryType || "-",
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
          manageBy: data.ManageBy || "-",
          qaRules: project.QARules ?? "-",
          rulesStatus: project.RulesStatus || "-",
          rulesApply: project.RulesApply || "-",
          dbStatus: project.DBStatus || "-",
          projectStatus: project.Status || "-",
          assignedBy: project.CreatedBy || "-",
          createdDate: project.CreatedDate || "-",
          developerIds: data.DeveloperIds || [],
          assignedTo: data.assignedTo || [],
        });
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, [id]);

  const columns = [
    "No.",
    "Delivery Status",
    "Start Time",
    "Delivery Time",
    "Delivery Code",
    "File Path",
  ];

  const colors = ["#1E40AF", "#9333EA", "#D9E021", "#EC4899", "#F97316"];
  const getAvatarColor = (name) => {
    if (!name) return "#6B7280"; // default gray
    const charCodeSum = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    return colors[charCodeSum % colors.length];
  };

  const canEditFeed = user?.permissions?.some(
    (perm) => perm.module === "Feed" && perm.actions.includes("update")
  ); 

  // Component for Assigned To avatars + popover

  const AssignedToAvatars = ({ assignedTo, getAvatarColor }) => {
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [openIdx, setOpenIdx] = useState(null); // for individual avatar clicks
    const popoverRef = useRef(null);

    useEffect(() => {
      const handleClickOutside = (e) => {
        if (popoverRef.current && !popoverRef.current.contains(e.target)) {
          setPopoverOpen(false);
          setOpenIdx(null);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const validMembers = (assignedTo || []).filter((m) => m && m.name);

    if (validMembers.length === 0) {
      return <div className="text-gray-400 text-xs">Unassigned</div>;
    }

    return (
    <div className="flex -space-x-2 relative" ref={popoverRef}>
  {/* Avatars */}
  {validMembers.slice(0, 3).map((member, idx) => (
    <div key={idx} className="relative">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer"
        style={{ backgroundColor: getAvatarColor(member.name), zIndex: validMembers.length - idx }}
        onClick={() => setPopoverOpen(!popoverOpen)} // toggle popover
      >
        {member.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .slice(0, 2)
          .toUpperCase()}
      </div>
    </div>
  ))}

  {/* Overflow +X */}
  {validMembers.length > 3 && (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-400 text-white text-xs font-bold cursor-pointer"
      onClick={() => setPopoverOpen(!popoverOpen)}
    >
      +{validMembers.length - 3}
    </div>
  )}

  {/* Popover showing all members on the left */}
  {popoverOpen && (
    <div className="absolute top-1/2 -translate-y-1/2 left-full mr-2 w-56 bg-white border border-gray-200 rounded-lg shadow-md z-50 p-3">
      {validMembers.map((member, idx) => (
        <div
          key={idx}
          className="flex items-center gap-2 py-1 hover:bg-gray-100 px-2 rounded"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ backgroundColor: getAvatarColor(member.name) }}
          >
            {member.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
          </div>
          <div className="flex flex-col text-sm">
            <span className="font-semibold">{member.name}</span>
            <span className="text-gray-500">{member.role || "Role"}</span>
          </div>
        </div>
      ))}
    </div>
  )}
</div>


    );
  };




  return (
    <>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-800 border-l-4 border-blue-500 pl-3">
            Feed Details
          </h2>
        </div>

        <div className="p-2 mt-4">
          {/* Feed Title */}
          {/* <h3 className="mb-4 text-lg font-bold">
            {feed?.projectCode} {feed?.projectName} &gt; {feed?.feedName}
          </h3> */}
          <h3 className="mb-4 text-lg">
            <span className="font-bold">{feed?.projectCode}</span>{" "}
            <span className="font-bold">{feed?.projectName}</span>{" "}
            <span className=" font-bold text-lg">
              &gt;
            </span>{" "}
            <span className="text-gray-700 font-semibold">{feed?.feedName}</span>
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white shadow-md rounded-2xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center gap-2 m-0">
                  <span className="w-2 h-6 bg-blue-500 rounded"></span>
                  Feed Details
                </h4>
                {canEditFeed && (
                <button
                  className="flex items-center gap-2 text-white px-3 py-1 rounded cursor-pointer bg-purple-600 hover:bg-purple-700"
                  onClick={() => navigate(`/projects/feed/${id}/update`)}
                >
                  <FaEdit size={16} />
                  <span>Edit</span>
                </button>
              )}
              </div>

              <hr className="border-gray-200 mb-4" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                {[
                  { label: "Feed ID", value: feed?.feedId },
                  { label: "Project", value: `${feed?.projectCode} ${feed?.projectName}` },
                  { label: "Frequency", value: feed?.Frequency, badge: true },
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
                  {
                    label: "Assigned To",
                    value: <AssignedToAvatars assignedTo={feed.assignedTo} getAvatarColor={getAvatarColor} />,
                  },
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
};

export default FeedDetails;
