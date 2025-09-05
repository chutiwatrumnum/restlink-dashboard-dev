import { useState, useEffect } from "react";
import { Button, Modal, message, Upload, ProgressProps, Input } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { dataFiles } from "../../../stores/interfaces/Document";
import { uploadDocument } from "../service/DocumentAPI";
import {
  callFailedModal,
  callSuccessModal,
} from "../../../components/common/Modal";
import SelectUnit from "../components/SelectUnit";
import { getFileInfoQuery } from "../../../utils/queriesGroup/documentQueries";
import { putEditFileMutation } from "../../../utils/mutationsGroup/documentMutations";

import type { RcFile, UploadFile } from "antd/es/upload/interface";
import type { RadioChangeEvent } from "antd";
import {
  DocumentDataType,
  ModalModeType,
  ByUnit,
  EditFileType,
} from "../../../stores/interfaces/Document";
type ProgressStatus = "normal" | "exception" | "active" | "success";

const { Dragger } = Upload;
interface ComponentCreateProps {
  isOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
  folderId: number;
  folderDetail?: DocumentDataType;
  mode?: ModalModeType;
  editData?: DocumentDataType;
}
const UploadPublic = (props: ComponentCreateProps) => {
  // Variables
  const maxUploadFile: number = 10;
  const {
    isOpen,
    callBack,
    folderId,
    folderDetail,
    mode = "create",
    editData,
  } = props;

  // Queries & Mutations
  const { data: fileData } = getFileInfoQuery({
    id: editData?.id.toString() ?? "",
    shouldFetch: !!editData,
  });
  const editFile = putEditFileMutation();

  // States
  const [draggerStatus, setDraggerStatus] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileUpload, setFileUpload] = useState<UploadFile>();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [processPercent, setProcessPercent] = useState<number>(0);
  const [statusProcessBar, setStatusProcessBar] =
    useState<ProgressStatus>("active");
  const [isAllowAll, setIsAllowAll] = useState<"y" | "n">("y");
  const [selectedAddress, setSelectedAddress] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [fileName, setFileName] = useState<string>("");

  // Functions
  const handleCancel = async () => {
    callBack(!isOpen, false);
    setIsAllowAll("y");
    setSelectedAddress([]);
    setFileList([]);
    setButtonLoading(false);
    setDraggerStatus(false);
    setFileName("");
    setDisabled(false);
  };

  const getBase64 = async (file: RcFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const UploadPublicFile = async () => {
    let res;
    setButtonLoading(true);
    setDraggerStatus(true);
    for await (const files of fileList) {
      let file: any = files;
      let database64: any = null;

      try {
        database64 = await getBase64(file.originFileObj);
      } catch (err) {
        console.error(err);
      }
      let dataFileUpload: dataFiles = {
        fileName: file.originFileObj.name,
        fileType: "pdf",
        fileSize: `${(file.originFileObj.size / 1024 / 1024).toFixed(2)} MB`,
        folderId: folderId,
        base64: database64,
        allowAll: isAllowAll,
        unitId: selectedAddress.map(Number),
      };

      fileList.map((e: any, i: number) => {
        if (e.uid === file.uid) {
          e.status = "uploading";
        }
      });
      setFileList(fileList);
      setFileUpload(file);
      res = await uploadDocument(dataFileUpload);

      if (!res?.status) {
        setDraggerStatus(false);
        setButtonLoading(false);
        fileList.map((e: any, i: number) => {
          if (e.uid === file.uid) {
            e.status = "error";
          }
        });
        setFileList(fileList);
        setStatusProcessBar("exception");
        break;
      } else {
        fileList.map((e: any, i: number) => {
          if (e.uid === file.uid) {
            e.status = "done";
          }
        });
        setFileList(fileList);
        setStatusProcessBar("success");
        res.status = true;
      }
    }
    if (res?.status) {
      callSuccessModal("Upload successfully", 1500);
      callBack(!isOpen, true);
      handleCancel();
    } else {
      callFailedModal("Upload failed", 1500);
    }
    setDisabled(false);
  };

  const handleSelectAddressChange = (value: number[]) => {
    // console.log(value);
    setSelectedAddress(value);
  };

  const onIsAllowAllChange = (e: RadioChangeEvent) => {
    // console.log(e.target.value);
    setIsAllowAll(e.target.value);
  };

  const fileNameHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFileName(e.target.value);
  };

  const editFileHandler = () => {
    const payload: EditFileType = {
      fileID: fileData?.id ?? "",
      fileName: fileName,
      allowAll: isAllowAll,
      unitId: selectedAddress.map(Number),
    };
    editFile
      .mutateAsync(payload)
      .then(() => {
        callSuccessModal("Edit successfully", 1500);
        handleCancel();
        callBack(!isOpen, true);
      })
      .catch((err) => {
        callFailedModal("Edit failed", 1500);
        console.warn("ERR => ", err);
      });
  };

  const submitHandler = () => {
    if (mode === "create") {
      setDisabled(true);
      UploadPublicFile();
    } else if (mode === "edit") {
      setDisabled(true);
      editFileHandler();
    } else {
      console.log("Something went wrong!");
    }
  };

  const propProcess: ProgressProps = {
    strokeColor: {
      "0%": "#108ee9",
      "100%": "#87d068",
    },
    strokeWidth: 3,
    showInfo: true,
    format: (percent) => percent && `${parseFloat(processPercent.toFixed(2))}%`,
  };

  // Actions
  useEffect(() => {
    if (mode === "edit" && fileData) {
      const dataAddress = fileData.byUnit.map((unit: ByUnit) => unit.unitId);
      if (fileData.allowUnitAll) {
        setIsAllowAll("y");
        setSelectedAddress([]);
      } else {
        setIsAllowAll("n");
        setSelectedAddress(dataAddress);
      }
      if (fileData.fileName.includes(".pdf")) {
        setFileName(fileData.fileName.replace(/\.pdf$/, ""));
      } else {
        setFileName(fileData.fileName);
      }
    }
  }, [isOpen, fileData]);

  useEffect(() => {
    if (processPercent) {
      (async function () {
        fileList.map((e: any, i: number) => {
          if (e.uid === fileUpload?.uid) {
            e.percent = processPercent;
          }
        });
        setFileList(fileList);
      })();
    }
  }, [processPercent]);

  return (
    <>
      <Modal
        title={`Add new document to ${folderDetail?.name ?? "House Documents"}`}
        width={700}
        centered
        open={isOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={buttonLoading}
            disabled={
              mode === "create"
                ? (fileList.length > 0 ? false : true) ||
                  (selectedAddress.length === 0 && isAllowAll === "n")
                : selectedAddress.length === 0 && isAllowAll === "n"
            }
            style={{ paddingLeft: 30, paddingRight: 30 }}
            onClick={submitHandler}
          >
            {mode === "create" ? "Upload" : "Save"}
          </Button>,
        ]}
      >
        <SelectUnit
          disabled={disabled}
          handleSelectChange={handleSelectAddressChange}
          selectValue={selectedAddress}
          isAllowAll={isAllowAll}
          onIsAllowAllChange={onIsAllowAllChange}
          folderId={folderId}
        />
        <div style={{ display: mode === "create" ? "block" : "none" }}>
          <Dragger
            accept="application/pdf"
            customRequest={({ file, onSuccess, onError }: any) => {
              if (maxUploadFile === fileList.length) {
                message.error(
                  `maximum file ${maxUploadFile} unit to one count upload.`
                );
                setTimeout(() => {
                  onError("error");
                }, 0);
                return false;
              }
              if (file.type !== "application/pdf") {
                message.error("upload pdf file only.");
                setTimeout(() => {
                  onError("error");
                }, 0);
                return false;
              } else if (file.size / 1024 / 1024 > 50) {
                message.error("file limit maximum 50 MB.");
                setTimeout(() => {
                  onError("error");
                }, 0);
                return false;
              } else if (file.size / 1024 / 1024 === 0) {
                message.error("file minimum 1 KB.");
                setTimeout(() => {
                  onError("error");
                }, 0);
                return false;
              } else {
                setTimeout(() => {
                  onSuccess("ok");
                }, 0);
              }
            }}
            fileList={fileList}
            maxCount={maxUploadFile}
            disabled={draggerStatus}
            onChange={async (info: any) => {
              let data: any = [];
              const result = info?.fileList?.filter(
                async (e: any, i: number) => {
                  if (e.status !== "error") {
                    e.status = "done";
                    data.push(e);
                    return e;
                  }
                }
              );
              await setFileList(data);
            }}
            onRemove={async (file: UploadFile) => {
              const allFile = fileList.filter((items: any, i: any) => {
                if (items.uid !== file.uid) {
                  return items;
                }
              });
              await setFileList(allFile);
            }}
            progress={{ ...propProcess }}
            multiple={true}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            <p className="ant-upload-hint">
              Support for a single or bulk upload. Strictly prohibited from
              uploading company data or other banned files.
            </p>
          </Dragger>
        </div>
        <div style={{ display: mode === "edit" ? "block" : "none" }}>
          <span>Folder name</span>
          <Input
            size="large"
            placeholder="Please input folder name"
            value={fileName}
            onChange={fileNameHandler}
          />
        </div>
      </Modal>
    </>
  );
};

export default UploadPublic;
