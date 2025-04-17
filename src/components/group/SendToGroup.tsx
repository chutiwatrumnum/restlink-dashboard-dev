import { useState, useEffect } from "react";
import {
  Button,
  Modal,
  Checkbox,
  Form,
  Input,
  Row,
  Col,
  Typography,
  Space,
} from "antd";
import { useSelector } from "react-redux";
import { RootState } from "../../stores";

import type { CheckboxChangeEvent } from "antd/es/checkbox";
import type { CheckboxValueType } from "antd/es/checkbox/Group";

const { Text } = Typography;
const CheckboxGroup = Checkbox.Group;

interface SendToGroupType {
  onChange: Function;
  defaultCheckedList86?: CheckboxValueType[];
  defaultCheckedList88?: CheckboxValueType[];
  isUseModal?: boolean;
}

const SendToGroup = ({
  onChange,
  defaultCheckedList86 = [],
  defaultCheckedList88 = [],
  isUseModal = false,
}: SendToGroupType) => {
  const blk86Options = useSelector(
    (state: RootState) => state.common.blk86Options
  );
  const blk88Options = useSelector(
    (state: RootState) => state.common.blk88Options
  );
  const blk86AllCheck = useSelector(
    (state: RootState) => state.common.blk86AllCheck
  );
  const blk88AllCheck = useSelector(
    (state: RootState) => state.common.blk88AllCheck
  );
  const [checkedList86, setCheckedList86] =
    useState<CheckboxValueType[]>(defaultCheckedList86);
  const [checkedList88, setCheckedList88] =
    useState<CheckboxValueType[]>(defaultCheckedList88);
  const [indeterminate, setIndeterminate] = useState(false);
  const [indeterminateBlk86, setIndeterminateBlk86] = useState(false);
  const [indeterminateBlk88, setIndeterminateBlk88] = useState(false);
  const [indeterminateModal86, setIndeterminateModal86] = useState(false);
  const [indeterminateModal88, setIndeterminateModal88] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  const [selectModal86, setSelectModal86] = useState(false);
  const [selectModal88, setSelectModal88] = useState(false);
  const [selectBlk86, setSelectBlk86] = useState(false);
  const [selectBlk88, setSelectBlk88] = useState(false);
  const [currentSelected, setCurrentSelected] = useState("");
  const [modal86Open, setModal86Open] = useState(false);
  const [modal88Open, setModal88Open] = useState(false);
  // const [result, setResult] = useState<CheckboxValueType[]>([]);

  const onSelected = (list: CheckboxValueType[]) => {
    if (currentSelected === "Blk 86") {
      setCheckedList86(list);

      setIndeterminateModal86(
        !!list.length && list.length < blk86AllCheck.length
      );
      setSelectModal86(list.length === blk86AllCheck.length);
    } else {
      setCheckedList88(list);

      setIndeterminateModal88(
        !!list.length && list.length < blk88AllCheck.length
      );
      setSelectModal88(list.length === blk88AllCheck.length);
    }
  };

  const onCheckBoxModalChange = (e: CheckboxChangeEvent) => {
    if (e.target.name === "86") {
      setSelectModal86(e.target.checked);
      setIndeterminateModal86(false);
      setCheckedList86(e.target.checked ? blk86AllCheck : []);
    } else {
      setSelectModal88(e.target.checked);
      setIndeterminateModal88(false);
      setCheckedList88(e.target.checked ? blk88AllCheck : []);
    }
  };

  const onCheckBoxChange = (e: CheckboxChangeEvent) => {
    if (e.target.name === "All") {
      setSelectAll(e.target.checked);
      setSelectBlk86(e.target.checked);
      setSelectBlk88(e.target.checked);
      setIndeterminate(false);
      setIndeterminateBlk86(false);
      setIndeterminateBlk88(false);
      setCheckedList86(e.target.checked ? blk86AllCheck : []);
      setCheckedList88(e.target.checked ? blk88AllCheck : []);
      onChange(
        e.target.checked ? [...blk86AllCheck, ...blk88AllCheck] : [],
        e.target.checked
      );
      return;
    }

    if (e.target.name === "Blk 86") {
      if (!isUseModal) {
        setSelectBlk86(e.target.checked);
        setIndeterminate(e.target.checked);
      } else {
        setCurrentSelected("Blk 86");
        setModal86Open(true);
      }
    } else {
      if (!isUseModal) {
        setSelectBlk88(e.target.checked);
        setIndeterminate(e.target.checked);
      } else {
        setCurrentSelected("Blk 88");
        setModal88Open(true);
      }
    }
  };

  const handleStateCheckBoxSendTo = () => {
    setSelectBlk86(
      checkedList86.length > 0 && checkedList86.length === blk86AllCheck.length
    );
    setIndeterminateBlk86(
      checkedList86.length > 0 && checkedList86.length !== blk86AllCheck.length
    );
    setSelectModal86(
      checkedList86.length > 0 && checkedList86.length === blk86AllCheck.length
    );
    setIndeterminateModal86(
      checkedList86.length > 0 && checkedList86.length !== blk86AllCheck.length
    );
    setSelectBlk88(
      checkedList88.length > 0 && checkedList88.length === blk88AllCheck.length
    );
    setIndeterminateBlk88(
      checkedList88.length > 0 && checkedList88.length !== blk88AllCheck.length
    );
    setSelectModal88(
      checkedList88.length > 0 && checkedList88.length === blk88AllCheck.length
    );
    setIndeterminateModal88(
      checkedList88.length > 0 && checkedList88.length !== blk88AllCheck.length
    );
    //----------------------------------------------
    if (
      checkedList86.length + checkedList88.length ===
        blk86AllCheck.length + blk88AllCheck.length &&
      checkedList86.length + checkedList88.length > 0
    ) {
      setSelectAll(true);
      setIndeterminate(false);
      setIndeterminateBlk88(false);
      setIndeterminateBlk86(false);
    } else if (checkedList86.length + checkedList88.length === 0) {
      setSelectAll(false);
      setIndeterminate(false);
    } else {
      setSelectAll(false);
      setIndeterminate(true);
    }
  };

  const handleOk = () => {
    let data = [...checkedList86, ...checkedList88];
    handleStateCheckBoxSendTo();
    onChange(data, selectAll);
    setModal86Open(false);
    setModal88Open(false);
  };

  const handleCancel86 = () => {
    setModal86Open(false);

    if (!!defaultCheckedList86.length) {
      setCheckedList86(defaultCheckedList86);
    } else {
      setCheckedList86([]);
      setSelectModal86(false);
      setIndeterminateModal86(false);
    }
  };

  const handleCancel88 = () => {
    setModal88Open(false);
    if (!!defaultCheckedList88.length) {
      setCheckedList88(defaultCheckedList88);
    } else {
      setCheckedList88([]);
      setSelectModal88(false);
      setIndeterminateModal88(false);
    }
  };

  useEffect(() => {
    handleStateCheckBoxSendTo();
  }, [checkedList86, checkedList88]);

  useEffect(() => {
    setCheckedList86(defaultCheckedList86);
    setCheckedList88(defaultCheckedList88);
  }, [defaultCheckedList86, defaultCheckedList88]);

  return (
    <>
      <Row>
        <Checkbox
          // indeterminate={indeterminate}
          onChange={onCheckBoxChange}
          checked={selectAll}
          name="All"
        >
          Select all
        </Checkbox>
        <Checkbox
          indeterminate={indeterminateBlk86}
          onChange={onCheckBoxChange}
          checked={selectBlk86}
          name="Blk 86"
        >
          Blk 86
        </Checkbox>
        <Checkbox
          indeterminate={indeterminateBlk88}
          onChange={onCheckBoxChange}
          checked={selectBlk88}
          name="Blk 88"
        >
          Blk 88
        </Checkbox>
      </Row>
      <Modal
        title="Select unit"
        open={modal86Open}
        width={500}
        onCancel={handleCancel86}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              style={{ width: 185 }}
              key="submit"
              type="primary"
              onClick={handleOk}
            >
              OK
            </Button>
          </div>
        }
        centered
      >
        <Row>
          <Text style={{ marginRight: 20 }}>Blk 86 </Text>
          <Checkbox
            indeterminate={indeterminateModal86}
            onChange={onCheckBoxModalChange}
            checked={selectModal86}
            name="86"
          >
            Select all
          </Checkbox>
        </Row>
        <div className="space" />
        <Row>
          <CheckboxGroup
            className="checkBoxUnitSelectedGrid"
            options={blk86Options}
            value={checkedList86}
            onChange={onSelected}
          />
        </Row>
      </Modal>
      <Modal
        title="Select unit"
        open={modal88Open}
        width={500}
        onCancel={handleCancel88}
        footer={
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Button
              style={{ width: 185 }}
              key="submit"
              type="primary"
              onClick={handleOk}
            >
              OK
            </Button>
          </div>
        }
        centered
      >
        <Row>
          <Text style={{ marginRight: 20 }}>Blk 88 </Text>
          <Checkbox
            indeterminate={indeterminateModal88}
            onChange={onCheckBoxModalChange}
            checked={selectModal88}
            name="88"
          >
            Select all
          </Checkbox>
        </Row>
        <Row>
          <CheckboxGroup
            className="checkBoxUnitSelectedGrid"
            options={blk88Options}
            value={checkedList88}
            onChange={onSelected}
          />
        </Row>
      </Modal>
    </>
  );
};

export default SendToGroup;
