import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getData } from "country-list";
import {toast} from 'react-hot-toast';

import Modal from "react-modal";

Modal.setAppElement("#root");

function CreateFeed({ onClose, onSuccess }) {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  // const [feedId, setFeedId] = useState("");
  const [feedName, setFeedName] = useState("");
  const [domainName, setDomainName] = useState("");
  const [applicationType, setApplicationType] = useState("");
  const [country, setCountry] = useState(null);

  const [tlId, setTlId] = useState(null);
  // const [pcId, setPcId] = useState(null);
  const [qaId, setQaId] = useState(null);
  const [devId, setDevId] = useState([]); // ✅ should be array for multi-select
  const [bauPerson, setBauPerson] = useState("");

  const [loading, setLoading] = useState(false);

  const [qaOptions, setQaOptions] = useState([]);
  const [tlOptions, setTlOptions] = useState([]);
  const [devOptions, setDevOptions] = useState([]);

  const [pcOptions, setPcOptions] = useState([]);

  const countryOptions = getData().map((c) => ({
    value: c.code,
    label: c.name,
  }));

  const [errors, setErrors] = useState({});

  // Fetch QA managers
  useEffect(() => {
    const loadQaManagers = async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/pm-qa`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch managers");

        const data = await res.json();
        setQaOptions(data.qaUsers || []);
      } catch (err) {
        console.error(err);
        setQaOptions([]);
      }
    };

    loadQaManagers();
  }, []);

    useEffect(() => {
    const loadProjectCoordinator = async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/pc`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch managers");

        const data = await res.json();
        setPcOptions(data.pcUsers || []);
      } catch (err) {
        console.error(err);
        setPcOptions([]);
      }
    };

    loadProjectCoordinator();
  }, []);

  // Fetch developers and TL
  useEffect(() => {
    const loadDevelopers = async () => {
      try {
        const res = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/users/tl-dev`,
          { credentials: "include" }
        );
        if (!res.ok) throw new Error("Failed to fetch developers");

        const data = await res.json();
        setTlOptions(data.tlUsers || []);
        setDevOptions(data.devUsers || []);
      } catch (err) {
        console.error(err);
        setTlOptions([]);
        setDevOptions([]);
      }
    };

    loadDevelopers();
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(
          `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/projects`,
          { credentials: "include" }
        );
        const result = await response.json();
        if (response.ok) {
          setProjects(result.data || []);
        } else {
          console.error("Failed to fetch projects:", result.message);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };

    fetchProjects();
  }, []);

  // const handleSave = async () => {
  //   try {
  //     setLoading(true);

  //     const payload = {
  //       projectId,
  //       FeedName: feedName,
  //       // FeedId: feedId,
  //       DomainName: domainName,
  //       ApplicationType: applicationType,
  //       CountryName: country?.value,
        
  //       TLId: tlId?.value || null,
  //       // QAId: qaId?.value || null,
  //       // PCId: pcId?.value || null,
  //       DeveloperIds: devId.map((d) => d.value),
  //       // BAUPersonId: bauPerson || null,  
  //       ExecutionPersonId : null, // Placeholder for future use
  //     };

  //     const response = await fetch(
  //       `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         credentials: "include",
  //         body: JSON.stringify(payload),
  //       }
  //     );

  //     const result = await response.json();

  //     if (response.ok) {
  //       // alert("Feed created successfully!");
  //       toast.success("Feed created successfully!");
  //       onSuccess?.(result.data);
  //       onClose();
  //     } else {
  //       // alert(result.message || "Failed to create feed");
  //       toast.error(result.message || "Failed to create feed");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };
const handleSave = async () => {
  try {
    setLoading(true);

    // ✅ Frontend validation
    const newErrors = {};
    if (!projectId) newErrors.projectId = "Project is required";
    if (!feedName) newErrors.feedName = "Feed Name is required";
    if (!domainName) newErrors.domainName = "Domain Name is required";
    if (!applicationType) newErrors.applicationType = "Platform Type is required";
    if (!country) newErrors.country = "Country is required";
    if (!tlId) newErrors.tlId = "Team Lead is required";
    // if (!devId || devId.length === 0) newErrors.devId = "At least one Developer is required";
    // if (!bauPerson) newErrors.bauPerson = "BAU Person is required"; // optional

    setErrors(newErrors); // ✅ update errors state

    // Stop if there are validation errors
    if (Object.keys(newErrors).length > 0) {
      setLoading(false);
      return;
    }

    // Prepare payload
    const payload = {
      projectId,
      FeedName: feedName,
      DomainName: domainName,
      ApplicationType: applicationType,
      CountryName: country?.value,
      TLId: tlId?.value || null,
      DeveloperIds: devId.map((d) => d.value),
      BAUPersonId: bauPerson || null,
      ExecutionPersonId: null,
    };

    const response = await fetch(
      `http://${import.meta.env.VITE_BACKEND_NETWORK_ID}/api/feed`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();

    if (response.ok) {
      toast.success("Feed created successfully!");
      onSuccess?.(result.data);
      onClose();
    } else {
      toast.error(result.message || "Failed to create feed");
    }
  } catch (err) {
    console.error(err);
    toast.error("Something went wrong!");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl shadow-xl relative">
        <h2 className="text-xl font-bold mb-6 text-gray-800">Add New Feed</h2>

        {/* Feed Details */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Feed Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project <span className="text-red-500">*</span>
              </label>
              <select
                value={projectId}
               onChange={(e) => {
    setProjectId(e.target.value);
    setErrors((prev) => ({ ...prev, projectId: "" })); // Clear project error
  }}
                  
                
                className="w-full border border-gray-300 rounded-r p-2"
              >
                <option value="" disabled hidden>
                  Select Project
                </option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                     {proj.ProjectCode} {proj.ProjectName}
                  </option>
                ))}
              </select>
                {errors.projectId && <p className="text-red-500 text-sm mt-1">{errors.projectId}</p>}
            </div>

            {/* Feed ID */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed ID
              </label>
              <input
                type="text"
                value={feedId}
                onChange={(e) => setFeedId(e.target.value)}
                placeholder="Enter Feed ID"
                className="w-full bg-gray-100 rounded p-2"
                required
              />
            </div> */}

            {/* Feed Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feed Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={feedName}
                 onChange={(e) => {
    setFeedName(e.target.value);
    setErrors((prev) => ({ ...prev, feedName: "" })); // Clear feedName error
  }}
                placeholder="Feed Name"
                className="w-full border border-gray-300 rounded-r p-2"
              />
              {errors.feedName && <p className="text-red-500 text-sm mt-1">{errors.feedName}</p>}
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={domainName}
                
                 onChange={(e) => {
    setDomainName(e.target.value);
    setErrors((prev) => ({ ...prev, domainName: "" })); // Clear feedName error
  }}
                placeholder="Domain Name"
                className="w-full border border-gray-300 rounded-r p-2"
              />
              {errors.domainName && <p className="text-red-500 text-sm mt-1">{errors.domainName}</p>}
            </div>

            {/* Application Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform Type <span className="text-red-500">*</span>
              </label>
              <select
                value={applicationType}
                // onChange={(e) => setApplicationType(e.target.value)}
                 onChange={(e) => {
    setApplicationType(e.target.value);
    setErrors((prev) => ({ ...prev, applicationType: "" })); // Clear feedName error
  }}
                className="w-full border border-gray-300 rounded-r p-2 text-gray-400"
              >
                <option value="" disabled hidden>
                  Select type
                </option>
                <option value="Web">Web</option>
                <option value="Mobile">App</option>
              </select>
              {errors.applicationType && <p className="text-red-500 text-sm mt-1">{errors.applicationType}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Name<span className="text-red-500">*</span>
              </label>
              <Select
  name="country"
  options={countryOptions}
  value={country}
  onChange={(selectedOption) => {
    setCountry(selectedOption); // ✅ selected option object
    setErrors((prev) => ({ ...prev, country: "" }));
  }}
  isSearchable
  placeholder="Select Country"
/>
{errors.country && <p className="text-red-500 text-sm mt-1">{errors.country}</p>}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Additional Information
          </h3>

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Coordinator
              </label>
              <Select
                options={pcOptions.map((u) => ({
                  value: u._id,
                  label: u.name,
                }))}
                value={pcId}
                onChange={setPcId}
                placeholder="Select PC"
              />
            </div> */}

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Lead<span className="text-red-500">*</span>
              </label>
              <Select
  options={tlOptions.map((u) => ({ value: u._id, label: u.name }))}
  value={tlId}
  onChange={(selectedOption) => {
    setTlId(selectedOption); // ✅ selected option object
    setErrors((prev) => ({ ...prev, tlId: "" }));
  }}
  placeholder="Select Team Lead"
/>
{errors.tlId && <p className="text-red-500 text-sm mt-1">{errors.tlId}</p>}
            </div>

            {/* Devs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Developers
              </label>
              <Select
                isMulti
                options={devOptions.map((u) => ({
                  value: u._id,
                  label: u.name,
                }))}
                value={devId}
                onChange={setDevId}
                placeholder="Select Developers..."
              />
            </div>

            {/* QA */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                QA Lead
              </label>
              <Select
                options={qaOptions.map((u) => ({
                  value: u._id,
                  label: u.name,
                }))}
                value={qaId}
                onChange={setQaId}
                placeholder="Select QA"
              />
            </div> */}

            {/* Execution Person */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Execution Person
              </label>
              <Select
                // options={tlOptions.map((u) => ({
                //   value: u._id,
                //   label: u.name,
                // }))}
                // value={tlId}
                // onChange={setTlId}
                placeholder="Select Execution Person if any"
              />
            </div>

            {/* BAU */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                BAU Person
              </label>
              <select
                value={bauPerson}
                onChange={(e) => setBauPerson(e.target.value)}
                className="w-full bg-gray-100 rounded p-2"
              >
                <option value="">Select Person</option>
                <option value="Aakanksha Dixit">Aakanksha Dixit</option>
              </select>
            </div> */}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-5 py-2 rounded-lg bg-blue-600 cursor-pointer text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFeed;
