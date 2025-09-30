import React, { useEffect, useState } from "react";
import MDEditor from "@uiw/react-md-editor";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
export default function QAReportDetails() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(false);

    const [comment, setComment] = useState("");
    const [file, setFile] = useState(null);
    //   const [status, setStatus] = useState("passed"); // new status field
    const [submitting, setSubmitting] = useState(false);

    // Fetch project
    const fetchProject = async () => {
        try {
            setLoading(true);
            const res = await fetch(
                `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${id}`,
                { credentials: "include" }
            );
            const data = await res.json();
            if (res.ok) setProject(data.project);
            else console.error(data.message);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProject(); }, [id]);

    // Submit QA report
    const submitQAReport = async () => {
        if (!comment && !file) return alert("Add comment or attachment");

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("comment", comment);
            formData.append("status", status);
            if (file) formData.append("file", file);

            const res = await fetch(
                `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${id}/qaReport`,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            );

            const result = await res.json();
            if (res.ok) {
                alert("QA Report submitted");
                setComment("");
                setFile(null);
                fetchProject();
                navigate(`/qa`);
            } else {
                alert(result.message || "Failed to submit QA report");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        } finally {
            setSubmitting(false);
        }
    };

    const addDeveloperComment = async () => {
        if (!comment.trim()) return alert("Add a comment");

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("comment", comment);
            // formData.append("status", "developer_comment"); // or whatever status you track

            const res = await fetch(
                `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/${id}/qaReport`,
                {
                    method: "POST",
                    body: formData,
                    credentials: "include",
                }
            );

            const result = await res.json();
            if (res.ok) {
                alert("Comment added");
                setComment("");
                fetchProject(); // Refresh project data to show new comment
            } else {
                alert(result.message || "Failed to add comment");
            }
        } catch (err) {
            console.error(err);
            alert("Server error");
        } finally {
            setSubmitting(false);
        }
    };


    if (loading) return <p className="p-4">Loading...</p>;
    if (!project) return <p className="p-4">No project found</p>;

    return (
        <div className="p-4 space-y-4">
            {/* Project Header */}
            <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
                {project.ProjectCode && project.ProjectName
                    ? `[${project.ProjectCode}] ${project.ProjectName}`
                    : "-"}
            </h3>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p className="text-sm text-gray-500">Project Name:</p>
                    <p className="font-semibold">{project.ProjectName}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Platform:</p>
                    <p className="font-semibold">{project.Platform}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">PM:</p>
                    <p className="font-semibold">{project.PMId?.name || "-"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">TL:</p>
                    <p className="font-semibold">{project.TLId?.name || "-"}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">Developer:</p>
                    <p className="font-semibold">{project.Developer}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">BAU:</p>
                    <p className="font-semibold">{project.BAU}</p>
                </div>
                <div>
                    <p className="text-sm text-gray-500">QA:</p>
                    <p className="font-semibold">{project.QA}</p>
                </div>
            </div>

            {/* QA Reports */}
            <div className="border-t border-gray-200 pt-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-800">QA Reports</h2>

                {project.qaReports?.length ? (
                    project.qaReports.map((r, idx) => (
                        <div
                            key={idx}
                            className="p-4 rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition-shadow duration-200 space-y-2"
                        >
                            {/* Name and Date/Time */}

                            <p className="text-xs text-gray-400">
                                {r.uploadedBy?.name || "Unknown"} • {new Date(r.uploadedAt || r.createdAt).toLocaleString()}
                            </p>


                            {/* Comment */}
                            {r.comment && (
                                <div className="prose prose-sm text-gray-700 max-w-full">
                                    <MDEditor.Markdown source={r.comment} />
                                </div>
                            )}

                            {/* File attachment */}
                            {r.fileLink && (
                                <a
                                    href={r.fileLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                >
                                    {r.fileName || "Attachment"}
                                </a>
                            )}

                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No QA reports yet.</p>
                )}
            </div>


            {/* Add new QA report */}
            <div className="border-t border-gray-200 pt-2 space-y-2">

                <MDEditor value={comment} onChange={setComment} height={150} />
                {user.roleName !== "Developer" && (

                    <input type="file" onChange={(e) => setFile(e.target.files[0])} />
                )}

                {user.roleName === "Developer" ? (
                    <button
                        onClick={addDeveloperComment}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Add Comment
                    </button>
                ) : (
                    <button
                        onClick={submitQAReport}
                        disabled={submitting}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                    >
                        {submitting ? "Submitting..." : "Submit QA Report"}
                    </button>
                )}

                {/* <button
                    onClick={submitQAReport}
                    disabled={submitting}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                >
                    {submitting ? "Submitting..." : "Submit QA Report"}
                </button> */}
            </div>
        </div>
    );
}
