import { ReactNode } from "react";
import { Button } from "antd";
import { whiteLabel } from "../../configs/theme";

interface MediumActionButtonType {
  message: string;
  className?: string;
  onClick: VoidFunction;
  type?: "primary" | "default" | "link" | "text" | "dashed" | undefined;
  disabled?: boolean;
  icon?: ReactNode;
}

const MediumActionButton = ({
  message,
  onClick,
  className,
  type = "primary",
  disabled,
  icon,
}: MediumActionButtonType) => {
  return (
    <Button
      type={type}
      htmlType="button"
      size="large"
      disabled={disabled ? disabled : false}
      shape={whiteLabel.buttonShape}
      style={{
        width: "45%",
        boxShadow: "none",
        fontWeight: whiteLabel.normalWeight,
      }}
      icon={icon ? icon : null}
      onClick={onClick}
      className={className}
    >
      {message}
    </Button>
  );
};

export default MediumActionButton;
