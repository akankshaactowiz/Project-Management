import { useState } from "react";

export default function QaActionsModal({ isOpen, onClose, projectId, onSubmit }) {
  const [status, setStatus] = useState("Open");
  const [fileName, setFileName] = useState("");
  const [fileLink, setFileLink] = useState("");

  if (!isOpen) return null;

  const handleSubmit = () => {
  if (!fileName || !fileLink) {
    alert("Please provide both File Name and QA Report Link");
    return;
  }

  onSubmit(
    projectId,
    status,                 // to
    "QA submitted report",  // comment
    fileName,               // fileName
    "QA",                   // role (must match backend check)
    fileLink                // fileLink
  );

  onClose();
};


  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded p-4 w-96">
        <h3 className="font-semibold mb-2">Submit QA Report</h3>

        <select
          className="border rounded w-full mb-2 p-1"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Open" disabled>Select Status</option>
          <option value="Open">Open</option>
          <option value="qa_passed">Passed</option>
          <option value="qa_failed">Failed</option>
          <option value="error">Error</option>
        </select>

        <input
          type="text"
          placeholder="File Name"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
          className="border rounded w-full mb-2 p-1"
        />

        <input
          type="text"
          placeholder="QA Report Link"
          value={fileLink}
          onChange={(e) => setFileLink(e.target.value)}
          className="border rounded w-full mb-2 p-1"
        />

        <div className="flex justify-end gap-2 mt-2">
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-300">Cancel</button>
          <button onClick={handleSubmit} className="px-3 py-1 rounded bg-blue-600 text-white">Submit</button>
        </div>
      </div>
    </div>
  );
}
