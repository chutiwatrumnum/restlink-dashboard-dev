import { Select } from "antd";

import "../styles/common.css";

interface SelectBoxInputType {
  options: object[];
  className?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  optionLabelProp?: string | undefined;
  size?: "small" | "middle" | "large" | undefined;
}

const SelectBox = ({
  className,
  onChange,
  defaultValue,
  options,
  optionLabelProp,
  size = "large",
}: SelectBoxInputType) => {
  return (
    <Select
      defaultValue={defaultValue}
      className={className}
      onChange={onChange}
      options={options}
      optionLabelProp={optionLabelProp}
      size={size}
    />
  );
};

export default SelectBox;
