import React, { useState, useEffect } from "react";
import Select from "react-select";
import { getData } from "country-list";

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
  const [pcId, setPcId] = useState(null);
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
        setPcOptions(data.qaUsers || []);
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

  const handleSave = async () => {
    try {
      setLoading(true);

      const payload = {
        projectId,
        FeedName: feedName,
        // FeedId: feedId,
        DomainName: domainName,
        ApplicationType: applicationType,
        CountryName: country?.value,
        
        TLId: tlId?.value || null,
        QAId: qaId?.value || null,
        DeveloperIds: devId.map((d) => d.value),
        // BAUPersonId: bauPerson || null,  
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
        alert("Feed created successfully!");
        onSuccess?.(result.data);
        onClose();
      } else {
        alert(result.message || "Failed to create feed");
      }
    } catch (err) {
      console.error(err);
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
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full border border-gray-300 rounded-r p-2"
              >
                <option value="" disabled hidden>
                  Select Project
                </option>
                {projects.map((proj) => (
                  <option key={proj._id} value={proj._id}>
                    {proj.ProjectName}
                  </option>
                ))}
              </select>
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
                onChange={(e) => setFeedName(e.target.value)}
                placeholder="Feed Name"
                className="w-full border border-gray-300 rounded-r p-2"
              />
            </div>

            {/* Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Domain Name
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
                Platform Type
              </label>
              <select
                value={applicationType}
                onChange={(e) => setApplicationType(e.target.value)}
                className="w-full border border-gray-300 rounded-r p-2 text-gray-400"
              >
                <option value="" disabled>
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

        {/* Additional Info */}
        <div className="mb-6">
          <h3 className="mb-4 bg-purple-200 text-purple-700 px-3 py-2 rounded-md text-md font-semibold">
            Additional Information
          </h3>

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
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
            </div>

           <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Lead
              </label>
              <Select
                options={tlOptions.map((u) => ({
                  value: u._id,
                  label: u.name,
                }))}
                value={tlId}
                onChange={setTlId}
                placeholder="Select Team Lead"
              />
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
            <div>
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
            </div>

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
            className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateFeed;
