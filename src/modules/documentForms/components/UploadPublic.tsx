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
  const maxUploadFile: number = 10;

  const [draggerStatus, setDraggerStatus] = useState<boolean>(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileUpload, setFileUpload] = useState<UploadFile>();
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [processPercent, setProcessPercent] = useState<number>(0);
  const [statusProcessBar, setStatusProcessBar] =
    useState<ProgressStatus>("active");

  const handleCancel = async () => {
    props.callBack(!props?.isOpen, false);
    setFileList([]);
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
        folderId: props?.FolderId,
        base64: database64,
      };
      fileList.map((e: any, i: number) => {
        if (e.uid === file.uid) {
          e.status = "uploading";
        }
      });
      setFileList(fileList);
      setFileUpload(file);
      res = await uploadDocument(dataFileUpload, setProcessPercent);

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
      Modal.success({ content: "Upload successfully", centered: true });
      destroyModal();
      setButtonLoading(false);
      setDraggerStatus(false);
      props.callBack(!props?.isOpen, true);
      setFileList([]);
    } else {
      Modal.success({ content: "Upload failed", centered: true });
      destroyModal();
    }
  };

  const destroyModal = () => {
    setTimeout(() => {
      Modal.destroyAll();
    }, 1500);
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

  useEffect(() => {
    if (props?.isOpen) {
      (async function () {})();
    }
  }, [props?.isOpen]);

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
        title="Add new public document "
        width={700}
        centered
        open={props?.isOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={buttonLoading}
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
          disabled={draggerStatus}
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
