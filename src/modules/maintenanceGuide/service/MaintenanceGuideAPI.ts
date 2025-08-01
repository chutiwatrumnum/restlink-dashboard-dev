import axios from "axios";
import {
  dataFiles,
  dataFilesPersonal,
} from "../../../stores/interfaces/MaintenanceGuide";

const deleteMaintenanceGuideById = async (id: string) => {
  try {
    const resultDelete = await axios.delete(
      `/document-project/dashboard/file?id=${id}`
    );
    if (resultDelete.status < 400) {
      return {
        status: true,
      };
    } else {
      console.warn("delete", resultDelete);
      return {
        status: false,
      };
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
    };
  }
};
const uploadMaintenanceGuide = async (file: dataFiles) => {
  try {
    // console.log("FILE SENDING ", file);
    const resultUploadMaintenanceGuide = await axios.post(
      "/document-project/dashboard/file",
      file
    );
    // console.log("resultUploadMaintenanceGuide:", resultUploadMaintenanceGuide);

    if (resultUploadMaintenanceGuide?.status < 400) {
      return {
        status: true,
        message: null,
      };
    } else {
      console.warn(
        "resultUploadMaintenanceGuide:",
        resultUploadMaintenanceGuide
      );
      return {
        status: false,
        message: resultUploadMaintenanceGuide.data.message,
      };
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
      message: null,
    };
  }
};

const uploadMaintenanceGuidePersonal = async (
  file: dataFilesPersonal,
  processFunc: Function
) => {
  try {
    const resultUploadMaintenanceGuide = await axios.post(
      "document-form/private/upload",
      file,
      {
        onUploadProgress: async (progressEvent: any) => {
          let percentComplete = progressEvent?.loaded / progressEvent?.total;
          percentComplete = percentComplete * 100;
          console.log("percentComplete:", percentComplete);
          await processFunc(Math.floor(percentComplete));
        },
      }
    );
    if (resultUploadMaintenanceGuide.status < 400) {
      return {
        status: true,
        message: null,
      };
    } else {
      console.warn(resultUploadMaintenanceGuide);

      return {
        status: false,
        message: resultUploadMaintenanceGuide.data.message,
      };
    }
  } catch (err) {
    console.error(err);
    return {
      status: false,
      message: null,
    };
  }
};
export {
  deleteMaintenanceGuideById,
  uploadMaintenanceGuide,
  uploadMaintenanceGuidePersonal,
};
