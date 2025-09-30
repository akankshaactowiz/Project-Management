import React, { useEffect, useState } from "react";

function EscalationModel({ isOpen, onClose, id, onSuccess, onError }) {
  const [escalation, setEscalation] = useState(null);

  useEffect(() => {
    if (!id || !isOpen) return; // don't fetch if modal is closed or id missing

    const fetchEscalationsDetails = async () => {
      try {
        const res = await fetch(`http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/escalations/${id}`,
          {
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data = await res.json();
        onSuccess();
        setEscalation(data);
        console.log("Escalation details:", data);
      } catch (err) {
        onError(err.message);
        console.error("Error fetching escalation details:", err);
      }
    };

    fetchEscalationsDetails();
  }, [id, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 overflow-auto">
      <div className="bg-white w-full max-w-4xl p-6 rounded-2xl shadow-xl relative mt-12">
        {escalation ? (
          <>
            <h2 className="text-xl font-bold mb-6 text-gray-800">{escalation.Project}</h2>

            <div className="mb-6">
              <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
                Escalation Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">No</label>
                  <input type="text" value={escalation.No} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div> */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input type="text" value={escalation.Title} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                  <input type="text" value={escalation["Created Date"]} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                  <input type="text" value={escalation.Project} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={escalation.Description} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <input type="text" value={escalation.Status} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Feed</label>
                  <input type="text" value={escalation.Feed} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned By</label>
                  <input type="text" value={escalation["Assigned By"]} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input type="text" value={escalation["Assigned To"]} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department From</label>
                  <input type="text" value={escalation["Department From"]} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department To</label>
                  <input type="text" value={escalation["Department To"]} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>
              </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Watcher</label>
                  <input type="text" value={escalation.Watcher} readOnly className="w-full bg-gray-100 rounded p-2" />
                </div>
              </div>
            

            <div className="flex justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-600">Loading escalation details...</p>
        )}
      </div>
    </div>
  );
}

export default EscalationModel;
