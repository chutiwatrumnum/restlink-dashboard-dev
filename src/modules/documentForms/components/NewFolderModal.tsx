import { useState, useEffect } from "react";
import { Button, Modal, Input } from "antd";
import {
  callFailedModal,
  callSuccessModal,
} from "../../../components/common/Modal";
import {
  postCreateFolderMutation,
  putEditFolderMutation,
} from "../../../utils/mutationsGroup/documentMutations";
import SelectUnit from "../../../components/common/SelectUnit";
import { getFolderInfoQuery } from "../../../utils/queriesGroup/documentQueries";

import type { RadioChangeEvent } from "antd";
import {
  DocumentDataType,
  CreateFolderType,
  ModalModeType,
  EditFolderType,
  ByUnitFolder,
} from "../../../stores/interfaces/Document";

interface ComponentCreateProps {
  isOpen: boolean;
  onCancel: () => void;
  folderId: number;
  fetchData: () => void;
  folderDetail?: DocumentDataType;
  mode?: ModalModeType;
  editData?: DocumentDataType;
}

const NewFolderModal = (props: ComponentCreateProps) => {
  // Variables
  const {
    isOpen,
    onCancel,
    folderId,
    folderDetail,
    fetchData,
    mode = "create",
    editData,
  } = props;

  // Queries & Mutations
  const { data: folderData } = getFolderInfoQuery({
    id: editData?.id.toString() ?? "",
    shouldFetch: !!editData,
  });
  const editFolder = putEditFolderMutation();
  const createFolderMutation = postCreateFolderMutation();

  // States
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);
  const [isAllowAll, setIsAllowAll] = useState<"y" | "n">("y");
  const [selectedAddress, setSelectedAddress] = useState<number[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [folderName, setFolderName] = useState("");

  // Functions
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
      .then(() => {
        callSuccessModal("Create folder successfully", 1500);
        handleCancel();
        fetchData();
      })
      .catch((err: any) => {
        console.log("CATCH => ", err);
        callFailedModal("Create folder failed", 1500);
        setButtonLoading(false);
        setDisabled(false);
      });
  };

  const handleSelectAddressChange = (value: number[]) => {
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

  const editFolderHandler = () => {
    const payload: EditFolderType = {
      folderId: folderData?.id ?? -1,
      folderName: folderName,
      allowAll: isAllowAll,
      unitId: selectedAddress.map(Number),
    };
    editFolder
      .mutateAsync(payload)
      .then(() => {
        callSuccessModal("Edit successfully", 1500);
        handleCancel();
        fetchData();
      })
      .catch((err) => {
        callFailedModal("Edit failed", 1500);
        console.warn("ERR => ", err);
      });
  };

  const submitHandler = () => {
    if (mode === "create") {
      setDisabled(true);
      createFolder();
    } else if (mode === "edit") {
      setDisabled(true);
      editFolderHandler();
    } else {
      console.log("Something went wrong!");
    }
  };

  // Actions
  useEffect(() => {
    if (mode === "edit" && folderData) {
      const dataAddress = folderData.byUnit.map(
        (unit: ByUnitFolder) => unit.unitId
      );
      if (folderData.allowUnitAll) {
        setIsAllowAll("y");
        setSelectedAddress([]);
      } else {
        setIsAllowAll("n");
        setSelectedAddress(dataAddress);
      }
      if (folderData?.name?.includes(".pdf")) {
        setFolderName(folderData.name.replace(/\.pdf$/, ""));
      } else {
        setFolderName(folderData.name);
      }
    }
  }, [isOpen, folderData]);

  return (
    <>
      <Modal
        title={`Create folder to ${folderDetail?.name ?? "House Documents"}`}
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
            onClick={submitHandler}
            disabled={
              mode === "create"
                ? folderName === "" ||
                  (selectedAddress.length === 0 && isAllowAll === "n")
                : selectedAddress.length === 0 && isAllowAll === "n"
            }
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
        />

        <span>Folder name</span>
        <Input
          size="large"
          placeholder="Please input folder name"
          value={folderName}
          onChange={folderNameHandler}
        />
      </Modal>
    </>
  );
};

export default NewFolderModal;
