import { useState, useEffect } from "react";
import { Button, Form } from "antd";
import { whiteLabel } from "../../configs/theme";
import type { FormInstance } from "antd";

interface MediumButtonType {
  message: string;
  className?: string;
  disabled?: boolean;
  form?: FormInstance;
}

const MediumButton = ({
  message = "Button",
  className,
  disabled,
  form,
}: MediumButtonType) => {
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
      type="primary"
      htmlType="submit"
      size="large"
      shape={whiteLabel.buttonShape}
      style={{ width: "45%", boxShadow: "none" }}
      disabled={disabled ? disabled : false || form ? submittable : false}
      className={className}
    >
      {message}
    </Button>
  );
};

export default MediumButton;
