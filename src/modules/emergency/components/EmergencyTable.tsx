import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { DataEmergencyTableDataType } from "../../../stores/interfaces/Emergency";

interface NormalTableType {
  columns: ColumnsType<DataEmergencyTableDataType>;
  data: DataEmergencyTableDataType[];
}

const EmergencyTable = ({ columns, data }: NormalTableType) => {
  const scroll: { x?: number | string } = {
    x: "max-content", // ปรับค่าตามความกว้างรวมของคอลัมน์
  };

  return (
    <Table
      style={{ whiteSpace: "nowrap" }}
      columns={columns}
      dataSource={data}
      scroll={scroll}
      pagination={false}
    />
  );
};

export default EmergencyTable;
