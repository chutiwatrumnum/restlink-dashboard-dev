import axios from "axios";
import {
  dataFiles,
  dataFilesPersonal,
} from "../../../stores/interfaces/Document";

const deleteDocumentFileById = async (id: string) => {
  try {
    const resultDelete = await axios.delete(
      `document-home/dashboard/file/?id=${id}`
    );
    // console.log(resultDelete);

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

const uploadDocument = async (file: dataFiles) => {
  try {
    // console.log("FILE SENDING ", file);
    const resultUploadDocument = await axios.post(
      "/document-home/dashboard/file",
      file
    );
    // console.log("resultUploadDocument:", resultUploadDocument);

    if (resultUploadDocument?.status < 400) {
      return {
        status: true,
        message: null,
      };
    } else {
      console.warn("resultUploadDocument:", resultUploadDocument);
      return {
        status: false,
        message: resultUploadDocument.data.message,
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

const uploadDocumentPersonal = async (
  file: dataFilesPersonal,
  processFunc: Function
) => {
  try {
    const resultUploadDocument = await axios.post(
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
    if (resultUploadDocument.status < 400) {
      return {
        status: true,
        message: null,
      };
    } else {
      console.warn(resultUploadDocument);

      return {
        status: false,
        message: resultUploadDocument.data.message,
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
export { deleteDocumentFileById, uploadDocument, uploadDocumentPersonal };
