import { useState, useEffect } from "react";
import Select from "react-select";
import { getData } from "country-list";
import Modal from "react-modal";
import toast from "react-hot-toast";

Modal.setAppElement("#root");

export default function CreateProjectModal({ isOpen, onClose, onSuccess }) {
  // --- Option states ---
  const [domainName, setDomainName] = useState("");
  const [feedName, setFeedName] = useState("");
  const [applicationType, setApplicationType] = useState("");
  const [country, setCountry] = useState(null);
  const [departmentOptions, setDepartmentOptions] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [pmOptions, setPmOptions] = useState([]); // managers for selected department
  const [bdeOptions, setBdeOptions] = useState([]); // business development execs
  const countryOptions = getData().map((c) => ({
    value: c.code,
    label: c.name,
  }));
  // --- State for form fields ---
  const [form, setForm] = useState({
    ProjectCode: "",
    ProjectName: "",
    SOWFile: "", // array
    // InputFiles: [],
    InputFiles: [null],
    Frequency: "",
    Priority: "",
    ProjectType: "",
    IndustryType: "",
    DeliveryType: "",
    Department: "",
    PM: "",
    BDE: "", // added BDE
    Timeline: "", // new field for target deadline
    Description: "",
  });

  // universal handler (works for regular inputs and for synthetic select calls)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // const departmentSelectOptions = departmentOptions.map((d) => ({
  //   value: d._id || d.id,
  //   label: d.department,  // <-- use 'department' key
  // }));

  // --- Load departments (filter to only R&D and Operation) and BDE list when modal opens ---
  useEffect(() => {
    if (!isOpen) return;

    // fetch departments and filter to R&D, Operation, BAU
    (async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/department`,
          { credentials: "include" }
        );
        const data = await res.json();

        console.log("Departments API response:", data);

        // Use `d.department` instead of `d.name`
        const filtered = data.filter((d) =>
          ["R&D", "Operation", "BAU"].includes(d.department?.trim())
        );

        setDepartmentOptions(filtered);
      } catch (err) {
        console.error("Failed to load departments:", err);
        setDepartmentOptions([]);
      }
    })();
  }, [isOpen]);

  // Map for React Select
  const departmentSelectOptions = departmentOptions.map((d) => ({
    value: d._id || d.id,
    label: d.department, // <-- use 'department' here
  }));


  // --- Fetch PMs (managers) when Department changes ---
  useEffect(() => {
    const deptId = form.Department;
    if (!deptId) {
      setPmOptions([]);
      setForm((prev) => ({ ...prev, PM: "" }));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/by-role?roleName=Manager&departmentId=${deptId}`,
          { credentials: "include" }
        );
        const data = await res.json();
        if (!cancelled) {
          setPmOptions(data || []);
          setForm((prev) => ({ ...prev, PM: "" }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load PMs:", err);
          setPmOptions([]);
        }
      }
    })();

    return () => { cancelled = true; };
  }, [form.Department]);

  // Fetch BDE 
  useEffect(() => {
    if (!isOpen) return;

    (async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/bde`,
          { credentials: "include" }
        );
        const data = await res.json();

        const options = (data.bdeUsers || []).map((u) => ({
          value: u._id,
          label: u.name,
        }));

        setBdeOptions(options);
      } catch (err) {
        console.error("Failed to load BDE list:", err);
        setBdeOptions([]);
      }
    })();
  }, [isOpen]);



  // --- Save handler (include DepartmentId and BDEId) ---
  // const handleSave = async () => {
  //   try {
  //     const payload = {
  //       ProjectCode: form.ProjectCode,
  //       ProjectName: form.ProjectName,
  //       Frequency: form.Frequency,
  //       Priority: form.Priority,
  //       ProjectType: form.ProjectType,
  //       PMId: form.PM || null,
  //       BDEId: form.BDE || null,
  //       DepartmentId: form.Department || null,
  //       SOWFile: form.SOWFile, // schema expects SOWFile
  //       SampleFiles: form.InputFiles, // schema expects SampleFiles
  //       Timeline: form.Timeline,
  //       Description: form.Description,
  //     };

  //     const res = await fetch(
  //       `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`,
  //       {
  //         method: "POST",
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     const data = await res.json();
  //     if (data.success) {
  //       alert("Project created successfully!");
  //       onClose();
  //     } else {
  //       alert(data.message || "Something went wrong");
  //     }
  //   } catch (error) {
  //     console.error("Error saving project:", error);
  //     alert("Failed to save project");
  //   }
  // };


  const allowedFormats = ["docx", "xls", "xlsx", "pdf"];
  const handleSave = async () => {
    try {
      

      const formData = new FormData();

      // Project fields
      formData.append("ProjectCode", form.ProjectCode);
      formData.append("ProjectName", form.ProjectName);
      formData.append("Frequency", form.Frequency);
      formData.append("Priority", form.Priority);
      formData.append("ProjectType", form.ProjectType);
      formData.append("IndustryType", form.IndustryType);
      formData.append("DeliveryType", form.DeliveryType);
      formData.append("PMId", form.PM || "");
      formData.append("BDEId", form.BDE || "");
      formData.append("DepartmentId", form.Department || "");
      formData.append("Timeline", form.Timeline || "");
      formData.append("Description", form.Description || "");

      // Files
      if (form.SOWFile) formData.append("SOWFile", form.SOWFile);
      form.InputFiles.forEach((file) => {
        if (file) formData.append("SampleFiles", file);
      });

      // Initial feed fields
      formData.append("FeedName", feedName);
      formData.append("DomainName", domainName);
      formData.append("ApplicationType", applicationType);
      formData.append("CountryName", country?.value || "");

      // --- Create project + initial feed on backend ---
      const res = await fetch(
        `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const projectData = await res.json();
      if (!projectData.success) throw new Error(projectData.message || "Failed to create project");

      toast.success("Project created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving project:", error);
       toast.error(`${error.message || "Something went wrong!"}`);
    }
  };




  if (!isOpen) return null;


  return (
   
     <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black/20 flex items-center justify-center z-50"
      className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-xl relative"
    >
      {/* Project Details Section */}
      <div className="mb-6">
        <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
          Project Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Project Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none">
                ACT-
              </span>
              <input
                type="text"
                name="ProjectCode"
                value={form.ProjectCode}
                onChange={handleChange}
                placeholder="Write Project Code"
                className="w-full border border-gray-300 rounded p-2 pl-16"
                required
              />
            </div>
          </div>

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              name="ProjectName"
              value={form.ProjectName}
              onChange={handleChange}
              placeholder="Project Name"
              className="w-full border border-gray-300 rounded-r p-2"
              required
            />
          </div>

          {/* SOW Document */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SOW Document</label>
            <div className="flex w-full rounded-lg border border-gray-500">
              <label
                htmlFor="sow-file"
                className="px-4 py-2 bg-gray-500 text-white rounded-l-md cursor-pointer"
              >
                Choose File
              </label>
              <input
                id="sow-file"
                type="file"
                onChange={(e) => setForm({ ...form, SOWFile: e.target.files[0] })}
                className="hidden"
                required
              />
              <span className="flex-grow px-4 py-2 text-gray-500 bg-white rounded-r-md">
                {form.SOWFile ? form.SOWFile.name : "No file chosen"}
              </span>
            </div>
          </div>

          {/* Sample File Attachments (Multiple) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sample Files</label>
            {form.InputFiles.map((file, idx) => (
              <div key={idx} className="flex items-center space-x-2 mb-2">
                <div className="flex flex-1 rounded-lg border border-gray-500">
                  <label
                    htmlFor={`input-file-${idx}`}
                    className="px-4 py-2 bg-gray-500 text-white rounded-l-md cursor-pointer transition-colors"
                  >
                    Choose File
                  </label>
                  <input
                    id={`input-file-${idx}`}
                    type="file"
                    onChange={(e) => {
                      const updated = [...form.InputFiles];
                      updated[idx] = e.target.files[0];
                      setForm({ ...form, InputFiles: updated });
                    }}
                    className="hidden"
                    required
                  />
                  <span className="flex-grow px-4 py-2 text-gray-500 bg-white rounded-r-md">
                    {file ? file.name : "No file chosen"}
                  </span>
                </div>

                {/* Remove Button */}
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const updated = form.InputFiles.filter((_, i) => i !== idx);
                      setForm({ ...form, InputFiles: updated });
                    }}
                    className="flex-shrink-0 px-3 py-1 bg-gray-500 text-white h-8 w-8 flex items-center justify-center hover:bg-gray-600 transition-colors"
                  >
                    ✕
                  </button>
                )}

                {/* Add Attachment Button */}
                {idx === form.InputFiles.length - 1 && (
                  <button
                    type="button"
                    onClick={() =>
                      setForm({ ...form, InputFiles: [...form.InputFiles, null] })
                    }
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    + Add
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Industry Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry Type
            </label>
            <select
              name="IndustryType"
              value={form.IndustryType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-r p-2"
            >
              <option value="" disabled hidden>
                Select Industry Type
              </option>
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

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Type
            </label>
            <select
              name="ProjectType"
              value={form.ProjectType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-r p-2"
            >
              <option value="" disabled hidden>
                Select Project Type
              </option>
              <option value="API">API</option>
              <option value="Data Service">Data Service</option>
            </select>
          </div>

          {/* Delivery Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Type
            </label>
            <select
              name="DeliveryType"
              value={form.DeliveryType}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-r p-2"
            >
              <option value="" disabled hidden>
                Select Delivery Type
              </option>
              <option value="POC">POC</option>
              <option value="BAU">BAU</option>
              <option value="R&D">R&D</option>
              <option value="Adhoc">Adhoc</option>
              <option value="Once-off">Once-off</option>
            </select>
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Frequency</label>
            <select
              name="Frequency"
              value={form.Frequency}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-r p-2"
            >
              <option value="" disabled hidden>
                Select Frequency
              </option>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
              <option value="OneTime">One-time</option>
              <option value="Adhoc">Adhoc</option>
            </select>

            {form.Frequency === "OneTime" && (
              <div>
                <label className="block font-medium mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={form.Timeline || ""}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, Timeline: e.target.value }))
                  }
                  className="w-full bg-gray-100 rounded p-2"
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
              className="w-full border border-gray-300 rounded-r p-2"
            >
              <option value="" disabled hidden>
                Select Priority
              </option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Department
            </label>
            <Select
              name="Department"
              value={
                form.Department
                  ? {
                      value: form.Department,
                      label: departmentSelectOptions.find(
                        (opt) => opt.value === form.Department
                      )?.label,
                    }
                  : null
              }
              onChange={(selected) =>
                handleChange({
                  target: { name: "Department", value: selected?.value || "" },
                })
              }
              options={departmentSelectOptions}
              placeholder="Select Department"
              isClearable
              isSearchable
              className="w-full"
            />
          </div>

          {/* Project Manager */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Manager
            </label>
            <Select
              name="PM"
              value={
                form.PM
                  ? {
                      value: form.PM,
                      label: pmOptions.find((u) => u._id === form.PM)?.name,
                    }
                  : null
              }
              onChange={(selected) =>
                handleChange({ target: { name: "PM", value: selected?.value } })
              }
              options={pmOptions.map((u) => ({ value: u._id, label: u.name }))}
              placeholder="Select Project Manager"
              isClearable
              isSearchable
              className="w-full"
            />
          </div>

          {/* Business Development Executive */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select BDE
            </label>
            <Select
              name="BDE"
              value={bdeOptions.find((opt) => opt.value === form.BDE) || null}
              onChange={(selected) =>
                handleChange({
                  target: { name: "BDE", value: selected?.value || "" },
                })
              }
              options={bdeOptions}
              placeholder="Select BDE"
              isClearable
              isSearchable
              className="w-full"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description / Additional Info{" "}
              <span className="text-red-500">*</span>
            </label>
            <textarea
              value={form.Description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, Description: e.target.value }))
              }
              placeholder="Enter description..."
              className="w-full border border-gray-300 rounded-r p-2"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Feed Details */}
      <div className="mb-6">
        <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
          Feed Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Feed Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Feed Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={feedName}
              onChange={(e) => setFeedName(e.target.value)}
              placeholder="Feed Name"
              className="w-full border border-gray-300 rounded-r p-2"
            />
          </div>

          {/* Domain Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain Name<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              placeholder="Domain Name"
              className="w-full border border-gray-300 rounded-r p-2"
            />
          </div>

          {/* Application Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Type
            </label>
            <select
              value={applicationType}
              onChange={(e) => setApplicationType(e.target.value)}
              className="w-full border border-gray-300 rounded-r p-2"
            >
              <option value="" disabled hidden>
                Select type
              </option>
              <option value="Web">Web</option>
              <option value="Mobile">App</option>
            </select>
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country Name
            </label>
            <Select
              name="country"
              options={countryOptions}
              value={country}
              onChange={setCountry}
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
          onClick={handleSave}
          className="cursor-pointer px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
        >
          Save Project
        </button>
      </div>
    </Modal>
   
  );
}
