// middlewares/logHistory.js
import ActivityHistory from "../models/ProjectHistory.js";

/**
 * Generic intelligent logging middleware for Project / Feed / future models
 * Supports auto-detection of "Created" or "Updated" actions,
 * generates human-readable summaries,
 * and fits your existing ActivityHistory schema.
 */
export const logHistory = async ({
  modelName,
  oldDoc = null,
  newDoc,
  userId,
  projectId = null,
  feedId = null,
}) => {
  try {
    if (!newDoc) return;

    const isNew = !oldDoc;
    let actionType = "Other";
    let description = "";

    // Helper: format a value for logging
    const formatValue = (val, field) => {
      if (!val) return null;

      // File fields: show only the last file added
      if ((field === "SOWFile" || field === "SampleFiles") && Array.isArray(val)) {
        const lastFile = val[val.length - 1];
        if (!lastFile?.fileName) return null;
        let name = lastFile.fileName.split("/").pop() || "";
        name = name.replace(/^\d+-/, ""); // remove numeric prefix
        return name;
      }

      if (Array.isArray(val)) return val.map(v => v?.name || v?.value || JSON.stringify(v)).join(", ");
      if (typeof val === "object") return val.name || val.value || JSON.stringify(val);
      return val.toString();
    };

    if (isNew) {
      actionType = `${modelName} Created`;
      description = `${modelName} ${newDoc?.ProjectName || newDoc?.FeedName || newDoc?._id} created`;
    } else {
      actionType = `${modelName} Updated`;
    }

    const changedFields = [];
    const summaries = [];
    const IGNORED_FIELDS = ["updatedAt", "createdAt", "__v", "_updatedBy"];

    const oldObj = oldDoc?.toObject?.() || oldDoc || {};
    const newObj = newDoc?.toObject?.() || newDoc || {};

    if (!isNew) {
      Object.keys(newObj).forEach(field => {
        if (IGNORED_FIELDS.includes(field)) return;
        if (field.startsWith("$") || field === "_doc") return;

        const oldValStr = formatValue(oldObj[field], field);
        const newValStr = formatValue(newObj[field], field);

        if (oldValStr !== newValStr) {
          changedFields.push({
            field,
            oldValue: oldValStr ? { value: oldValStr } : null,
            newValue: newValStr ? { value: newValStr } : null,
          });

          summaries.push(`${field} changed from "${oldValStr || "N/A"}" → "${newValStr || "N/A"}"`);
        }
      });

      if (summaries.length > 0) {
        description += ` (${summaries.join(", ")})`;
      } else {
        description += " Updated";
      }
    }

    // ✅ Single ActivityHistory record containing all changed fields
    if (changedFields.length > 0 || isNew) {
      await ActivityHistory.create({
        projectId: projectId || newDoc?.projectId,
        feedId: feedId || newDoc?._id,
        FeedName: newDoc?.FeedName,
        ProjectName: newDoc?.ProjectName,
        actionType,
        changedFields,
        description,
        performedBy: userId,
      });
    }
  } catch (err) {
    console.error(`❌ [${modelName}] History Log Error:`, err.message);
  }
};





