import { useState } from "react";

export default function QACharts() {
  const [activeTab, setActiveTab] = useState("All");

  const tabList = ["All", "BAU", "Non BAU"];

  // Dummy data for cards
  const feedSLAData = [
    { title: "Feed SLA Card 1", value: "98.5%" },
    { title: "Feed SLA Card 2", value: "99.2%" },
    { title: "Feed SLA Card 3", value: "97.8%" },
  ];

  const qaSLAData = [
    { title: "QA SLA Card 1", value: "95.4%" },
    { title: "QA SLA Card 2", value: "96.8%" },
    { title: "QA SLA Card 3", value: "94.7%" },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-gray-300 mb-6">
        {tabList.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-4 -mb-px font-semibold border-b-2 transition-colors duration-200
              ${
                activeTab === tab
                  ? "border-purple-700 text-purple-700"
                  : "border-transparent text-gray-600 hover:text-purple-700"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Feed SLA & QA SLA Sections */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Feed SLA */}
        <section className="flex-1 bg-white p-4 rounded space-y-4">
          <h3 className="text-sm font-semibold mb-4 border-b pb-2 border-gray-200">
            Feed SLA
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {feedSLAData.map(({ title, value }, i) => (
              <div
                key={i}
                className="bg-purple-50 rounded p-4 text-center shadow-sm"
              >
                <p className="text-gray-500 text-sm mb-1">{title}</p>
                <p className="text-2xl font-bold text-purple-800">{value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* QA SLA */}
        <section className="flex-1 bg-white p-4 rounded space-y-4">
          <h3 className="text-sm font-semibold mb-4 border-b pb-2 border-gray-200">
            QA SLA
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {qaSLAData.map(({ title, value }, i) => (
              <div
                key={i}
                className="bg-purple-50 rounded p-4 text-center shadow-sm"
              >
                <p className="text-gray-500 text-sm mb-1">{title}</p>
                <p className="text-2xl font-bold text-purple-800">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Charts area (placeholder) */}
      <section className="bg-white rounded shadow p-6">
        <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-gray-200">
          Charts & Graphs
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-purple-100 rounded h-48 flex items-center justify-center text-purple-700 font-semibold">
            Chart 1 Placeholder
          </div>
          <div className="bg-purple-100 rounded h-48 flex items-center justify-center text-purple-700 font-semibold">
            Chart 2 Placeholder
          </div>
          {/* Add more charts if you want */}
        </div>
      </section>
    </div>
  );
}
