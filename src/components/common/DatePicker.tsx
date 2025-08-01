import { DatePicker } from "antd";

import { Dayjs } from "dayjs";

import "../styles/common.css";

interface DatePickerInputType {
  onChange: (dates: [Dayjs, Dayjs], dateStrings: [string, string]) => void;
  picker?: "date" | "time" | "week" | "month" | "quarter" | "year" | undefined;
  className?: string;
}

const { RangePicker } = DatePicker;

const DatePickerInput = ({
  onChange,
  picker = "date",
  className,
}: DatePickerInputType) => {
  return (
    <RangePicker
      className={className}
      size="large"
      onChange={onChange}
      picker={picker}
      allowClear
    />
  );
};

export default DatePickerInput;
