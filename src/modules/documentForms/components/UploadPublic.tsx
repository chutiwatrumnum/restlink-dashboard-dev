import { useState, useEffect } from "react";
import { Button, Modal, message, Upload, ProgressProps } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { useDispatch } from "react-redux";
import { Dispatch } from "../../../stores";
import type { RcFile, UploadFile } from "antd/es/upload/interface";
import { dataFiles } from "../../../stores/interfaces/Document";
import { uploadDocument } from "../service/DocumentAPI";

import { DocumentDataType } from "../../../stores/interfaces/Document";
type ProgressStatus = "normal" | "exception" | "active" | "success";
const { Dragger } = Upload;
interface ComponentCreateProps {
  isOpen: boolean;
  callBack: (isOpen: boolean, saved: boolean) => void;
  FolderId: number;
  folderDetail?: DocumentDataType;
}
interface IupdateFile {
  [index: string]: UploadFile;
}
const UploadPublic = (props: ComponentCreateProps) => {
  const dispatch = useDispatch<Dispatch>();
  const [DraggerSatatus, setDraggerSatatus] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileUpload, setfileUpload] = useState<UploadFile>();
  const [buttonloading, setbuttonloading] = useState<boolean>(false);
  const [ProcessPercent, setProcessPercent] = useState<number>(0);
  const [statusProcessbar, setstatusProcessbar] =
    useState<ProgressStatus>("active");
  const handleCancel = async () => {
    await props.callBack(!props?.isOpen, false);
    await setFileList([]);
  };
  const maxUploadFile: number = 10;
  const getBase64 = async (file: RcFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  useEffect(() => {
    if (props?.isOpen) {
      (async function () {})();
    }
  }, [props?.isOpen]);

  useEffect(() => {
    if (ProcessPercent) {
      (async function () {
        fileList.map((e: any, i: number) => {
          if (e.uid === fileUpload?.uid) {
            e.percent = ProcessPercent;
          }
        });
        await setFileList(fileList);
      })();
    }
  }, [ProcessPercent]);

  const UploadPublicFile = async () => {
    let resultapi: any;
    await setbuttonloading(true);
    await setDraggerSatatus(true);
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
        folderId: props?.FolderId,
        base64: database64,
      };
      fileList.map((e: any, i: number) => {
        if (e.uid === file.uid) {
          e.status = "uploading";
        }
      });
      await setFileList(fileList);
      await setfileUpload(file);
      resultapi = await uploadDocument(dataFileUpload, setProcessPercent);
      if (!resultapi?.status) {
        await setDraggerSatatus(false);
        await setbuttonloading(false);
        fileList.map((e: any, i: number) => {
          if (e.uid === file.uid) {
            e.status = "error";
          }
        });
        await setFileList(fileList);
        await setstatusProcessbar("exception");
        break;
      } else {
        fileList.map((e: any, i: number) => {
          if (e.uid === file.uid) {
            e.status = "done";
          }
        });
        await setFileList(fileList);
        await setstatusProcessbar("success");
        resultapi.status = true;
      }
    }
    if (resultapi?.status) {
      dispatch.common.updateSuccessModalState({
        open: true,
        text: "Successfully upload document file.",
      });
      await setbuttonloading(false);
      await setDraggerSatatus(false);
      await props.callBack(!props?.isOpen, true);
      await setFileList([]);
    } else {
      dispatch.common.updateSuccessModalState({
        open: true,
        status: "error",
        text: resultapi?.message
          ? resultapi?.message
          : "failed upload dcument file.",
      });
    }
  };

  const propProcess: ProgressProps = {
    strokeColor: {
      "0%": "#108ee9",
      "100%": "#87d068",
    },
    strokeWidth: 3,
    showInfo: true,
    format: (percent) => percent && `${parseFloat(ProcessPercent.toFixed(2))}%`,
  };
  return (
    <>
      <Modal
        title="Add new public document "
        width={700}
        centered
        open={props?.isOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={buttonloading}
            disabled={fileList.length > 0 ? false : true}
            style={{ paddingLeft: 30, paddingRight: 30 }}
            onClick={UploadPublicFile}
          >
            Upload
          </Button>,
        ]}
      >
        <div>{props?.folderDetail?.folderName ?? "Public folder"}</div>
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
          disabled={DraggerSatatus}
          onChange={async (info: any) => {
            let data: any = [];
            const result = info?.fileList?.filter(async (e: any, i: number) => {
              if (e.status !== "error") {
                e.status = "done";
                data.push(e);
                return e;
              }
            });
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
      </Modal>
    </>
  );
};

export default UploadPublic;
