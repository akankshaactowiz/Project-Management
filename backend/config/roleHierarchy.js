export const roleHierarchy = {
  Superadmin: ["Manager", "Team Lead", "Developer", "Project Admin","Project Coordinator"],
  Manager: ["Project Coordinator","Team Lead", "Developer"],
  "Team Lead": ["Developer"],
  Developer: [],

  "Sales Head": ["Sales Manager", "Business Development Executive"],
  "Sales Manager": ["Business Development Executive"],
  "Business Development Executive": [],
};  