import React, { useState } from "react";

const AssignQAModal = ({ projectId, isOpen, onClose, onAssign, isAssigned }) => {
  const [fileName, setFileName] = useState("");
  const [fileLink, setFileLink] = useState("");

  const handleSubmit = () => {
    if (!fileName || !fileLink) {
      alert("Please fill both fields.");
      return;
    }

    onAssign(projectId, { fileName, fileLink });
    setFileName("");
    setFileLink("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-md shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Assign Project to QA</h2>
        <div className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="File Name"
            className="border px-3 py-2 rounded w-full"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <input
            type="text"
            placeholder="File Link"
            className="border px-3 py-2 rounded w-full"
            value={fileLink}
            onChange={(e) => setFileLink(e.target.value)}
          />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border hover:bg-gray-100"
          >
            Cancel
          </button>
         <button
  onClick={handleSubmit}
  // disabled={isAssigned} // disables if already assigned
  // className={`px-4 py-2 rounded text-white 
  //   ${
  //   isAssigned
  //     ? "bg-gray-400 cursor-not-allowed"
  //     : "bg-blue-600 hover:bg-blue-700"
  // }`}
  className="px-4 py-2 rounded text-white bg-blue-600 hover:bg-blue-700"
>
  Assign
  {/* {isAssigned ? "Assigned" : "Assign"} */}
</button>


        </div>
      </div>
    </div>
  );
};

export default AssignQAModal;
