import { Radio, Select } from "antd";
import { getUnitListQuery } from "../../utils/queriesGroup/documentQueries";

import type { RadioChangeEvent } from "antd";

interface SelectUnitProps {
  isAllowAll: "y" | "n";
  onIsAllowAllChange: (e: RadioChangeEvent) => void;
  disabled: boolean;
  selectValue: number[];
  handleSelectChange: (value: number[]) => void;
}

const SelectUnit = (props: SelectUnitProps) => {
  const {
    isAllowAll,
    onIsAllowAllChange,
    disabled,
    selectValue,
    handleSelectChange,
  } = props;
  const { data: unitData, isLoading: isLoadingUnit } = getUnitListQuery();
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginBottom: 16,
        gap: 8,
      }}
    >
      <span>Send to</span>
      <Radio.Group
        name="isAllowAllRadio"
        value={isAllowAll}
        onChange={onIsAllowAllChange}
        disabled={disabled}
        options={[
          { value: "y", label: "Select all" },
          { value: "n", label: "Custom select" },
        ]}
      />
      <span>Select address no.</span>
      <Select
        mode="multiple"
        size="large"
        placeholder="Please select address no."
        value={selectValue}
        onChange={handleSelectChange}
        style={{ width: "100%" }}
        options={unitData}
        loading={isLoadingUnit}
        fieldNames={{ value: "unitId" }}
        disabled={isAllowAll === "y" || disabled}
        filterOption={(input, option) =>
          (option?.label ?? "")
            .toString()
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        allowClear
      />
    </div>
  );
};

export default SelectUnit;
