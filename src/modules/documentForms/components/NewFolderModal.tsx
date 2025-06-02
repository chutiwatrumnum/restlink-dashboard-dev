import { useState } from "react";
import { Button, Modal, Select, Radio } from "antd";
import {
  callFailedModal,
  callSuccessModal,
} from "../../../components/common/Modal";

import { getUnitListQuery } from "../../../utils/queriesGroup/documentQueries";
import type { RadioChangeEvent } from "antd";
import { DocumentDataType } from "../../../stores/interfaces/Document";

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

  // States
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [isAllowAll, setIsAllowAll] = useState<"y" | "n">("y");
  const [selectedAddress, setSelectedAddress] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);

  const createFolder = async () => {
    console.log("create");
  };

  const handleSelectAddressChange = (value: string[]) => {
    let arrNumber = value.map(Number);
    // console.log(arrNumber);
    setSelectedAddress(arrNumber);
  };

  const onIsAllowAllChange = (e: RadioChangeEvent) => {
    // console.log(e.target.value);
    setIsAllowAll(e.target.value);
  };

  const handleCancel = () => {
    setIsAllowAll("y");
    setSelectedAddress([]);
    setDisabled(false);
    setButtonLoading(false);
    onCancel();
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
              createFolder();
              setDisabled(true);
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
            onChange={handleSelectAddressChange}
            style={{ width: "100%" }}
            options={unitData}
            loading={isLoadingUnit}
            fieldNames={{ value: "unitId" }}
            disabled={isAllowAll === "y" || disabled}
          />
        </div>
      </Modal>
    </>
  );
};

export default NewFolderModal;
