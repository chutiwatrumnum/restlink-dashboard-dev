import { useState, useEffect } from "react";
import { Button, Form } from "antd";
import { whiteLabel } from "../../configs/theme";
import type { FormInstance } from "antd";

interface SmallActionButtonType {
  message: string;
  className?: string;
  onClick: VoidFunction;
  size?: "small" | "middle" | "large";
  form?: FormInstance;
  type?: "primary" | "default" | "link" | "text" | "dashed" | undefined;
}

const SmallActionButton = ({
  message,
  onClick,
  className,
  size = "large",
  form,
  type = "primary",
}: SmallActionButtonType) => {
  const [submittable, setSubmittable] = useState(false);
  // Watch all values
  const values = Form.useWatch([], form);

  useEffect(() => {
    form?.validateFields({ validateOnly: true }).then(
      () => {
        setSubmittable(false);
      },
      () => {
        setSubmittable(true);
      }
    );
  }, [values]);
  return (
    <Button
      type={type}
      htmlType="button"
      size={size}
      shape={whiteLabel.buttonShape}
      style={{ width: "25%", boxShadow: "none" }}
      onClick={onClick}
      className={className}
      disabled={form ? submittable : false}
    >
      {message}
    </Button>
  );
};

export default SmallActionButton;
