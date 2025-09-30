// utils/permissions.js
export const hasPermission = (role, module, action) => {
  if (!role?.permissions) return false;

  const modulePerm = role.permissions.find((p) => p.module === module);

  if (!modulePerm) return false;

  const actions = modulePerm.actions || [];
  return actions.includes("*") || actions.includes(action);
};
