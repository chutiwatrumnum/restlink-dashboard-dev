import React, {useState} from "react";
import dayjs from "dayjs";
import {
  Modal,
  Row,
  Col,
} from "antd";
import customParseFormat from "dayjs/plugin/customParseFormat";
dayjs.extend(customParseFormat);
interface ApprovedResidentSignUpProps {
  resident: any;
  isOpen: boolean;
  callBack: (isOpen: boolean) => void;
}
const ApprovedResidentSignUp = (props: ApprovedResidentSignUpProps) => {

  const [isModalOpen, setIsModalOpen] = useState(false);

 const onOk = () =>{
  setIsModalOpen(false);
 }

  const handleCancel = async () => {
    await props.callBack(!props?.isOpen);
  };
  return (
    <>
      <Modal
        title="Are you sure you want to approved this?"
        width={700}
        centered
        open={props?.isOpen}
        onOk={onOk}
        onCancel={handleCancel}
        >
        </Modal>
    </>
  );
};

export default ApprovedResidentSignUp;
