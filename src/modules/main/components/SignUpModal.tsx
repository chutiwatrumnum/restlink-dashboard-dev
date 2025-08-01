// Hooks
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";

// Components
import { Modal, Input } from "antd";

interface SignUpModalProps {
  onOk: (code: string) => void;
  onClose: () => void;
}
const SignUpModal = (props: SignUpModalProps) => {
  const { onOk, onClose } = props;
  const dispatch = useDispatch<Dispatch>();
  const { isSignUpModalOpen } = useSelector(
    (state: RootState) => state.userAuth
  );

  // States
  const [code, setCode] = useState("");

  // Functions
  const onInputCode = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(e.target.value);
  };

  const onSendCode = () => {
    onOk(code);
    dispatch.userAuth.updateIsSignUpModalOpenState(false);
  };

  const onCancel = () => {
    onClose();
    setCode("");
    dispatch.userAuth.updateIsSignUpModalOpenState(false);
  };

  return (
    <Modal
      width={400}
      open={isSignUpModalOpen}
      title={
        <span style={{ fontWeight: "var(--font-bold)" }}>
          Sign up with invite code
        </span>
      }
      onOk={onSendCode}
      onCancel={onCancel}
      centered={true}
      closable
    >
      <div className="flex flex-col gap-2">
        <span>Code</span>
        <Input
          size="large"
          placeholder="Enter your invite code here"
          onChange={onInputCode}
        />
      </div>
      <div className="mt-4">
        <p>
          If you don't have a code. Please contact the appropriate authority.
        </p>
      </div>
    </Modal>
  );
};

export default SignUpModal;
