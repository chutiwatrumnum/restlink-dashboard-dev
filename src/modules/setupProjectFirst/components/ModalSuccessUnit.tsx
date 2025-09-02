import { CheckCircleFilled } from '@ant-design/icons';
import {
    Button,
    Modal,
} from "antd";
import { useNavigate } from "react-router-dom";
interface SetupSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SetupSuccessModal: React.FC<SetupSuccessModalProps> = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const redirectToDashboard = () => {
        navigate('/dashboard/prfile');
    }
    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            centered
            closable={false}
            maskClosable={false}
            className="setup-success-modal"
            width={400}
        >
            <div className="flex flex-col items-center text-center p-6 ">
                <div className="mb-4">
                    <CheckCircleFilled style={{ fontSize: '64px', color: '#38BE43' }} />
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                    Everything is set up!
                </h2>
                <p className="text-[#929292] mb-6">
                    Property unit name created successfully
                </p>
                <Button
                    type="primary"
                    size="large"
                    onClick={redirectToDashboard}
                    className="w-full bg-[#1e3a8a] hover:bg-[#1e40af] border-none rounded-lg px-8 py-2 h-12 font-medium"
                >
                    Go to dashboard
                </Button>
            </div>
        </Modal>
    );
};

export default SetupSuccessModal;