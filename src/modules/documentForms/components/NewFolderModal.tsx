import { useState } from "react";
import { Button, Modal, Select, Radio, Input } from "antd";
import {
  callFailedModal,
  callSuccessModal,
} from "../../../components/common/Modal";
import { postCreateFolderMutation } from "../../../utils/mutationsGroup/documentMutations";

import { getUnitListQuery } from "../../../utils/queriesGroup/documentQueries";
import type { RadioChangeEvent } from "antd";
import {
  DocumentDataType,
  CreateFolderType,
} from "../../../stores/interfaces/Document";

interface ComponentCreateProps {
  isOpen: boolean;
  onCancel: () => void;
  folderId: number;
  folderDetail?: DocumentDataType;
}

const NewFolderModal = (props: ComponentCreateProps) => {
  // Variables
  const { isOpen, onCancel, folderId, folderDetail } = props;
  const { data: unitData, isLoading: isLoadingUnit } = getUnitListQuery();
  const createFolderMutation = postCreateFolderMutation();

  // States
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [isAllowAll, setIsAllowAll] = useState<"y" | "n">("y");
  const [selectedAddress, setSelectedAddress] = useState<string[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [folderName, setFolderName] = useState("");

  const createFolder = async () => {
    setButtonLoading(true);
    setDisabled(true);
    let payload: CreateFolderType = {
      allowAll: isAllowAll,
      folderName: folderName,
      unitId: selectedAddress.map(Number),
      folderOwnerId: folderId,
    };

    // console.log(payload);
    await createFolderMutation
      .mutateAsync(payload)
      .then((res: any) => {
        console.log(res);
        callSuccessModal("Create folder successfully", 1500);
        handleCancel();
      })
      .catch((err: any) => {
        console.log(err);
        callFailedModal("Create folder failed", 1500);
        setButtonLoading(false);
        setDisabled(false);
      });
  };

  const handleSelectAddressChange = (value: string[]) => {
    // console.log(arrNumber);
    setSelectedAddress(value);
  };

  const onIsAllowAllChange = (e: RadioChangeEvent) => {
    setIsAllowAll(e.target.value);
  };

  const handleCancel = () => {
    setIsAllowAll("y");
    setSelectedAddress([]);
    setFolderName("");
    setDisabled(false);
    setButtonLoading(false);
    onCancel();
  };

  const folderNameHandler = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFolderName(e.target.value);
  };
  return (
    <>
      <Modal
        title={`Create folder to ${folderDetail?.name ?? "Home documents"}`}
        width={700}
        centered
        open={isOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={buttonLoading}
            style={{ paddingLeft: 30, paddingRight: 30 }}
            onClick={() => {
              setDisabled(true);
              createFolder();
            }}
          >
            Upload
          </Button>,
        ]}
      >
        <div className="flex flex-col mb-8 gap-4">
          <span>Send to</span>
          <Radio.Group
            name="isAllowAllRadio"
            value={isAllowAll}
            onChange={onIsAllowAllChange}
            disabled={disabled}
            options={[
              { value: "y", label: "Select all" },
              { value: "n", label: "Custom select" },
            ]}
          />
          <span>Select address no.</span>
          <Select
            mode="multiple"
            size="large"
            placeholder="Please select address no."
            value={selectedAddress}
            onChange={handleSelectAddressChange}
            style={{ width: "100%" }}
            options={unitData}
            loading={isLoadingUnit}
            fieldNames={{ value: "unitId" }}
            disabled={isAllowAll === "y" || disabled}
            allowClear
          />
          <span>Folder name</span>
          <Input
            size="large"
            placeholder="Please input folder name"
            value={folderName}
            onChange={folderNameHandler}
          />
        </div>
      </Modal>
    </>
  );
};

export default NewFolderModal;
