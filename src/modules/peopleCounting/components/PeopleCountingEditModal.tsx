import { useState, useEffect } from "react";
import { Form, Input, Row, Col } from "antd";
import { requiredRule } from "../../../configs/inputRule";

import FormModal from "../../../components/common/FormModal";
import SmallButton from "../../../components/common/SmallButton";

import {
  PeopleCountingFormDataType,
  PeopleCountingDataType,
} from "../../../stores/interfaces/PeopleCounting";

type PeopleCountingEditModalType = {
  isEditModalOpen: boolean;
  onOk: (payload: PeopleCountingFormDataType) => void;
  onCancel: () => void;
  data?: PeopleCountingDataType;
};

const PeopleCountingEditModal = ({
  isEditModalOpen,
  onOk,
  onCancel,
  data,
}: PeopleCountingEditModalType) => {
  // variables
  const [form] = Form.useForm();
  const [open, setOpen] = useState(false);

  // functions
  const onFinish = (value: PeopleCountingFormDataType) => {
    const payload: PeopleCountingFormDataType = {
      id: data?.id,
      lowStatus: 0,
      mediumStatus: parseInt(value.mediumStatus.toString()),
      highStatus: parseInt(value.highStatus.toString()),
    };
    onOk(payload);
  };

  const onMediumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // console.log(e.target.value);
    form.setFieldValue("lowStatus", `<${e.target.value}`);
  };

  const validateMediumStatus = async (rule: any, value: any) => {
    if (parseInt(value) < 1) {
      return Promise.reject("Value must be more than 1");
    }
    return Promise.resolve();
  };

  const validateHighStatus = async (rule: any, value: any, callback: any) => {
    const mediumStatus = form.getFieldValue("mediumStatus");

    if (parseInt(value) <= parseInt(mediumStatus)) {
      return Promise.reject("Value must be more than medium status");
    }
    return Promise.resolve();
  };

  // actions
  useEffect(() => {
    setOpen(isEditModalOpen);
    if (data) {
      form.setFieldsValue({
        roomName: data.facility.name,
        detail: data.facility.description,
        lowStatus: `<${data.mediumStatus}`,
        mediumStatus: data.mediumStatus,
        highStatus: data.highStatus,
      });
    }
  }, [isEditModalOpen]);

  // components
  const ModalContent = () => {
    return (
      <Form
        form={form}
        name="peopleCountingCreateModal"
        className="peopleCountingFormContainer"
        initialValues={{ remember: true }}
        autoComplete="off"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={() => {
          console.log("FINISHED FAILED");
        }}
      >
        <div className="peopleCountingModalColumn">
          <Col span={24}>
            <Form.Item<PeopleCountingFormDataType>
              label="Room name"
              name="roomName"
            >
              <Input size="large" placeholder="Room name" disabled={true} />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item<PeopleCountingFormDataType> label="Detail" name="detail">
              <Input.TextArea
                rows={5}
                placeholder="Detail"
                disabled={true}
                style={{ resize: "none" }}
              />
            </Form.Item>
          </Col>
          <p>Number of people to display status (low, medium, high)</p>
          <Row justify="space-between" align="middle" style={{ width: "100%" }}>
            <Col span={7}>
              <Form.Item<PeopleCountingFormDataType>
                label="Low"
                name="lowStatus"
                rules={requiredRule}
              >
                <Input size="large" placeholder="Input low" disabled={true} />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item<PeopleCountingFormDataType>
                label="Medium"
                name="mediumStatus"
                rules={[...requiredRule, { validator: validateMediumStatus }]}
              >
                <Input
                  type="number"
                  size="large"
                  placeholder="Input medium"
                  onChange={onMediumChange}
                />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item<PeopleCountingFormDataType>
                label="High"
                name="highStatus"
                rules={[...requiredRule, { validator: validateHighStatus }]}
              >
                <Input type="number" size="large" placeholder="Input high" />
              </Form.Item>
            </Col>
          </Row>
          <Row justify="end">
            <SmallButton className="saveButton" message="Save" form={form} />
          </Row>
        </div>
      </Form>
    );
  };

  return (
    <>
      <FormModal
        isOpen={open}
        title="Edit Room"
        content={<ModalContent />}
        onOk={onOk}
        onCancel={onCancel}
        className="peopleCountingFormModal"
      />
    </>
  );
};

export default PeopleCountingEditModal;
