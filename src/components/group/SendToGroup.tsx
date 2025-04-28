import { useState, useEffect } from "react";
import { Button, Modal, Checkbox, Row, Typography } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../stores";

import type { GetProp } from "antd";

const CheckboxGroup = Checkbox.Group;

interface SendToGroupType {
  onChange: (data: number[]) => void;
  isModalOpen?: boolean;
  onClose: () => void;
  data: any[];
}

const SendToGroup = ({
  onChange,
  isModalOpen = false,
  onClose,
  data,
}: SendToGroupType) => {
  // variables
  const [unitData, setUnitData] = useState<number[]>([]);
  const unitOptions = useSelector(
    (state: RootState) => state.common.unitOptions
  );

  // functions
  const handleCancelModal = () => {
    onClose();
  };

  const handleOk = () => {
    onChange(unitData);
    onClose();
  };

  const onSelected: GetProp<typeof Checkbox.Group, "onChange"> = (
    checkedValues: any
  ) => {
    // console.log("checked = ", checkedValues);
    setUnitData(checkedValues);
  };

  useEffect(() => {
    setUnitData(data);
  }, [data]);

  return (
    <>
      <Modal
        title="Select unit"
        open={isModalOpen}
        width={800}
        onCancel={handleCancelModal}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}>
            <Button
              shape="round"
              style={{ width: 185 }}
              key="submit"
              type="primary"
              onClick={handleOk}>
              OK
            </Button>
          </div>
        }
        centered>
        <Row>
          <CheckboxGroup
            className="checkBoxUnitSelectedGrid"
            value={unitData}
            options={unitOptions}
            onChange={onSelected}
          />
        </Row>
      </Modal>
    </>
  );
};

export default SendToGroup;
