import { Button, Form } from "antd";
import { whiteLabel } from "../../configs/theme";
import type { FormInstance } from "antd";
import { useState, useEffect } from "react";

interface SmallButtonType {
  message: string;
  className?: string;
  formSubmit?: () => void;
  disabled?: boolean;
  form?: FormInstance;
}

const SmallButton = ({
  message = "Button",
  className,
  formSubmit,
  form,
}: SmallButtonType) => {
  const [submittable, setSubmittable] = useState(false);

  // Watch all values
  const values = Form.useWatch([], form);

  useEffect(() => {
    form?.validateFields({ validateOnly: true }).then(() => setSubmittable(false))
      .catch((e) => {
        if (e?.errorFields?.length > 0) {
          setSubmittable(true)

        } else {
          setSubmittable(false)
        }

      });
  }, [values]);
  return (
    <Button
      type="primary"
      htmlType="submit"
      size="large"
      onClick={formSubmit ? formSubmit : undefined}
      shape={whiteLabel.buttonShape}
      style={{ width: "25%", boxShadow: "none" }}
      className={className}
      disabled={form ? submittable : false}
    >
      {message}
    </Button>
  );
};

export default SmallButton;
