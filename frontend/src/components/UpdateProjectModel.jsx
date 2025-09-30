import { useState, useEffect } from "react";
import Select from "react-select";
import { FaTimes } from "react-icons/fa";
import { getData } from "country-list";
import { useNavigate } from "react-router-dom";

export default function UpdateProjectModal({ isOpen, onClose, project, onUpdate }) {
     const navigate = useNavigate();    

    const [domainName, setDomainName] = useState("");
    const [applicationType, setApplicationType] = useState("");
    const [country, setCountry] = useState(null);
    const [feedName, setFeedName] = useState("");

    const [departmentOptions, setDepartmentOptions] = useState([]);
    const [pmOptions, setPmOptions] = useState([]);
    const [bdeOptions, setBdeOptions] = useState([]);

    const countryOptions = getData().map((c) => ({
        value: c.code,
        label: c.name,
    }));
const [form, setForm] = useState({
        ProjectCode: "",
        ProjectName: "",
        SOWFile: null,
        InputFiles: [null],
        Frequency: "",
        Priority: "",
        ProjectType: "",
        IndustryType: "",
        DeliveryType: "",
        Department: "",
        PM: "",
        BDE: "",
        Timeline: "",
        Description: "",
    });
    // Load departments
    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const res = await fetch(
                    `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/department`,
                    { credentials: "include" }
                );
                const data = await res.json();
                const filtered = data.filter(d =>
                    ["R&D", "Operation", "BAU"].includes(d.department?.trim())
                );
                setDepartmentOptions(filtered || []);
            } catch (err) {
                console.error(err);
                setDepartmentOptions([]);
            }
        })();
    }, [isOpen]);



    // Load PMs when Department changes
    useEffect(() => {
        const deptId = form.Department;
        if (!deptId) return setPmOptions([]);

        (async () => {
            try {
                const res = await fetch(
                    `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/by-role?roleName=Manager&departmentId=${deptId}`,
                    { credentials: "include" }
                );
                const data = await res.json();
                setPmOptions(Array.isArray(data)
                    ? data.map(u => ({ value: u._id, label: u.name }))
                    : []
                );
            } catch (err) {
                console.error("Error fetching users by role and department:", err);
                setPmOptions([]);
            }
        })();
    }, [form.Department]);

    // Load BDEs
    useEffect(() => {
        if (!isOpen) return;
        (async () => {
            try {
                const res = await fetch(
                    `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/bde`,
                    { credentials: "include" }
                );
                const data = await res.json();
                setBdeOptions(Array.isArray(data.bdeUsers)
                    ? data.bdeUsers.map(u => ({ value: u._id, label: u.name }))
                    : []);
            } catch (err) {
                console.error(err);
                setBdeOptions([]);
            }
        })();
    }, [isOpen]);

    // Load project data
    useEffect(() => {
        if (!project) return;

        const codeSuffix = project.ProjectCode
            ?.replace(/[\[\]ACT-]/g, '') || "";

        setForm({
            ProjectCode: codeSuffix,
            ProjectName: project.ProjectName || "",
            Frequency: project.Frequency || "",
            Priority: project.Priority || "",
            ProjectType: project.ProjectType || "",
            IndustryType: project.IndustryType || "",
            DeliveryType: project.DeliveryType || "",  
            Department: project.DepartmentId?._id || project.DepartmentId || "",
            PM: project.PMId?._id || "",
            BDE: project.BDEId?._id || "",
            Timeline: project.Timeline || "",
            Description: project.Description || "",
            SOWFile: null,
            InputFiles: [null],
        });

        const firstFeed = project.Feeds?.[0] || {};
        setFeedName(firstFeed.FeedName || "");
        setDomainName(firstFeed.DomainName || "");
        setApplicationType(firstFeed.ApplicationType || "");
        setCountry(firstFeed.CountryName
            ? { value: firstFeed.CountryName, label: firstFeed.CountryName }
            : null
        );
    }, [project]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const data = new FormData();

            const suffix = form.ProjectCode.replace(/^ACT-?/, '');
            const fullCode = `ACT-${suffix}`;
            data.append("ProjectCode", fullCode);
            data.append("DepartmentId", form.Department || null);
            data.append("PMId", form.PM || null);
            data.append("BDEId", form.BDE || null);

            Object.keys(form).forEach(key => {
                if (key === "InputFiles") {
                    form.InputFiles.forEach(f => f && data.append("SampleFiles", f));
                } else if (key === "SOWFile" && form.SOWFile) {
                    data.append("SOWFile", form.SOWFile);
                } else if (key !== "ProjectCode") {
                    data.append(key, form[key]);
                }
            });

            // Feed fields
            data.append("FeedName", feedName);
            data.append("DomainName", domainName);
            data.append("ApplicationType", applicationType);
            data.append("CountryName", country?.value || "");

            const res = await fetch(
                `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects/updates/${project._id}`,
                { method: "PUT", body: data, credentials: "include" }
            );

            const result = await res.json();
            if (result.success) {
                alert("Project updated successfully!");
                onUpdate(result.project);
                onClose();
            } else alert(result.message || "Failed to update project");
        } catch (err) {
            console.error(err);
            alert("Server error while updating project");
        }
    };

      const departmentSelectOptions = Array.isArray(departmentOptions)
        ? departmentOptions.map(d => ({ value: d._id, label: d.department }))
        : [];
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <FaTimes />
                </button>

                <h2 className="text-xl font-bold mb-6 text-gray-800">Update Project Details</h2>

                {/* Project Details */}
                <div className="mb-6">
                    <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md font-semibold text-md">
                        Project Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Project Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project Code
                            </label>
                            <input
                                type="text"
                                name="ProjectCode"
                                value={form.ProjectCode}
                                onChange={handleChange}
                                placeholder="Enter code"
                                className="w-full border border-gray-300 rounded p-2"
                                required
                            />
                        </div>

                        {/* Project Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                            <input
                                type="text"
                                name="ProjectName"
                                value={form.ProjectName}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2"
                            />
                        </div>

                        {/* SOW File */}
                        <div>
                            <label className="block font-medium mb-1">SOW Document</label>
                            <div className="flex w-full rounded-lg border border-gray-500">
                                <label htmlFor="sow-file-update" className="px-4 py-2 bg-gray-500 text-white rounded-l-md cursor-pointer">
                                    Choose File
                                </label>
                                <input
                                    id="sow-file-update"
                                    type="file"
                                    onChange={(e) => setForm(prev => ({ ...prev, SOWFile: e.target.files[0] }))}
                                    className="hidden"
                                />
                                <span className="flex-grow px-4 py-2 text-gray-500 bg-white rounded-r-md truncate">
                                    {form.SOWFile ? form.SOWFile.name : 'no file chosen'}
                                </span>
                            </div>
                            <button className="text-sm text-blue-500 hover:underline mt-2"
                            onClick={() => navigate(`/project/${project._id}/files`)}
                            _target="blank">
                            
                                View Previous Version
                            </button>
                        </div>

                        {/* Sample Files */}
                        <div>
                            <label className="block font-medium mb-1">Sample Files</label>
                            {form.InputFiles.map((file, idx) => (
                                <div key={idx} className="flex gap-2 mb-2 items-center">
                                    <div className="flex flex-1 rounded-lg border border-gray-500">
                                        <label htmlFor={`sample-file-${idx}`} className="px-4 py-2 bg-gray-500 text-white rounded-l-md cursor-pointer">
                                            Choose File
                                        </label>
                                        <input
                                            id={`sample-file-${idx}`}
                                            type="file"
                                            onChange={(e) => {
                                                const updated = [...form.InputFiles];
                                                updated[idx] = e.target.files[0];
                                                setForm(prev => ({ ...prev, InputFiles: updated }));
                                            }}
                                            className="hidden"
                                        />
                                        <span className="flex-grow px-4 py-2 text-gray-500 bg-white rounded-r-md truncate">
                                            {file ? file.name : 'no file chosen'}
                                        </span>
                                    </div>
                                    {idx > 0 && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const updated = form.InputFiles.filter((_, i) => i !== idx);
                                                setForm(prev => ({ ...prev, InputFiles: updated }));
                                            }}
                                            className="flex-shrink-0 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600"
                                        >
                                            ✕
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button className="text-sm text-blue-500 hover:underline mt-2 mr-2"
                            onClick={() => navigate(`/project/${project._id}/files`)}
                            _target="blank">
                            
                                View Previous Version
                            </button>
                            <button
                                type="button"
                                onClick={() => setForm(prev => ({ ...prev, InputFiles: [...prev.InputFiles, null] }))}
                                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                + Add Attachment
                            </button>
                        </div>
                        
                        {/* Industry Type */}
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Industry Type</label>
                            <select
                                name="IndustryType"
                                value={form.IndustryType}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="" disabled>Select Industry Type</option>
                                <option value="E-com">E-com</option>
                <option value="Food">Food</option>
                <option value="Q-com">Q-com</option>
                <option value="Sports">Sports</option>
                  <option value="Travel">Travel</option>
                <option value="OTT">OTT</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Government">Government</option>  
                <option value="Event">Event</option>
                <option value="Social Media">Social Media</option>
                <option value="Music">Music</option>
                            </select>
                        </div>

                        {/* Delivery Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Type</label>
                            <select
                                name="DeliveryType"
                                value={form.DeliveryType}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="" disabled>Select Delivery Type</option>
                                <option value="POC">POC</option>
                                <option value="BAU">BAU</option>
                                <option value="R&D">R&D</option>
                                <option value="Adhoc">Adhoc</option>
                            </select>
                        </div>
                       

                       {/* Project Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                            <select
                                name="ProjectType"
                                value={form.ProjectType}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="" disabled>Select Project Type</option>
                                 <option value="API">API</option>
                <option value="Data Service">Data Service</option>
                             
                            </select>
                        </div>
                        

                        {/* Frequency */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Frequency</label>
                            <select
                                name="Frequency"
                                value={form.Frequency}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="" disabled>Select Frequency</option>
                                <option value="Daily">Daily</option>
                                <option value="Weekly">Weekly</option>
                                <option value="Monthly">Monthly</option>
                                <option value="OneTime">One-time</option>
                                <option value="Adhoc">Adhoc</option>
                            </select>
                            {form.Frequency === "OneTime" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Deadline</label>
                                    <input
                                        type="date"
                                        value={form.Timeline}
                                        onChange={(e) => setForm(prev => ({ ...prev, Timeline: e.target.value }))}
                                        className="w-full border border-gray-300 rounded p-2"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Priority</label>
                            <select
                                name="Priority"
                                value={form.Priority}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="" disabled>Select Priority</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select Department</label>
                            <Select
                                value={departmentSelectOptions.find(o => o.value === form.Department) || null}
                                onChange={(selected) => setForm(prev => ({ ...prev, Department: selected?.value || "" }))}
                                options={departmentSelectOptions}
                                isClearable
                            />
                        </div>

                        {/* PM */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Manager</label>
                            <Select
                                value={pmOptions.find(o => o.value === form.PM) || null}
                                onChange={(selected) => setForm(prev => ({ ...prev, PM: selected?.value || "" }))}
                                options={pmOptions || []} // pmOptions already mapped to {value, label}
                                isClearable
                            />
                        </div>
                        {/* BDE */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select BDE</label>
                            <Select
                                name="BDE"
                                value={bdeOptions.find(o => o.value === form.BDE) || null}
                                onChange={(selected) => setForm(prev => ({ ...prev, BDE: selected?.value || "" }))}
                                options={bdeOptions || []}
                                isClearable
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={form.Description}
                                onChange={(e) => setForm(prev => ({ ...prev, Description: e.target.value }))}
                                className="w-full border border-gray-300 rounded p-2"
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {/* Feed Details */}
                <div className="mb-6">
                    <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md font-semibold text-md">
                        Feed Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Feed Name</label>
                            <input
                                type="text"
                                value={feedName}
                                onChange={(e) => setFeedName(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Domain Name</label>
                            <input
                                type="text"
                                value={domainName}
                                onChange={(e) => setDomainName(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Application Type</label>
                            <select
                                value={applicationType}
                                onChange={(e) => setApplicationType(e.target.value)}
                                className="w-full border border-gray-300 rounded p-2"
                            >
                                <option value="" disabled>Select type</option>
                                <option value="Web">Web</option>
                                <option value="Mobile">App</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country Name</label>
                            <Select
                                name="country"
                                options={countryOptions}
                                value={country}
                                onChange={(selected) => setCountry(selected)}
                                isSearchable
                                placeholder="Select Country"
                            />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                        Update
                    </button>
                </div>
            </div>
        </div>
    );
}
