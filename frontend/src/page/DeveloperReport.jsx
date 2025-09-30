import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function DeveloperReport() {
  const { uniqueId } = useParams();
  const [report, setReport] = useState(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/developer-report/${uniqueId}`,
        { credentials: "include" }
      );
      const data = await res.json();
      if (res.ok) setReport(data.report);
    };
    fetchReport();
  }, [uniqueId]);

  const handleAddComment = async () => {
    const res = await fetch(
      `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/developer-report/${uniqueId}/comment`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ comment }),
      }
    );
    if (res.ok) {
      setReport({
        ...report,
        developerComments: [
          ...(report.developerComments || []),
          { comment, date: new Date().toISOString() },
        ],
      });
      setComment("");
    }
  };

  if (!report) return <p>Loading report...</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-2">QA Report</h2>
      <p><b>Status:</b> {report.status}</p>
      <p><b>Comment:</b> {report.comment}</p>
      {report.fileLink && (
        <a href={report.fileLink} target="_blank" rel="noreferrer" className="text-blue-500 underline">
          Download Attachment
        </a>
      )}

      <h3 className="mt-4 font-semibold">Developer Comments</h3>
      <ul className="list-disc ml-6">
        {(report.developerComments || []).map((c, idx) => (
          <li key={idx}>{c.comment} <span className="text-sm text-gray-500">({new Date(c.date).toLocaleString()})</span></li>
        ))}
      </ul>

      <div className="mt-3">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="Add your comment..."
        />
        <button
          onClick={handleAddComment}
          className="bg-blue-600 text-white px-4 py-2 rounded mt-2"
        >
          Submit Comment
        </button>
      </div>
    </div>
  );
}
