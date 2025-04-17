import { Button } from "antd";
import { whiteLabel } from "../../configs/theme";

interface ButtonType {
  message: string;
  className?: string;
}

const LargeButton = ({ message = "Button", className }: ButtonType) => {
  return (
    <Button
      type="primary"
      htmlType="submit"
      size="large"
      shape={whiteLabel.buttonShape}
      className={className}
      style={{ boxShadow: "none" }}
      block
    >
      <h3>{message}</h3>
    </Button>
  );
};

export default LargeButton;
