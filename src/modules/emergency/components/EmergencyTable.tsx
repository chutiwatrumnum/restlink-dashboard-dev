import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { DataEmergencyTableDataType } from "../../../stores/interfaces/Emergency";


interface NormalTableType {
  columns: ColumnsType<DataEmergencyTableDataType>;
  data: DataEmergencyTableDataType[];
}

const AnnounceTable = ({ columns, data }: NormalTableType) => {
  return (
    <Table
      style={{ whiteSpace: "nowrap" }}
      columns={columns}
      dataSource={data}
      scroll={{ x: "100%" }}
      pagination={false}
    />
  );
};

export default AnnounceTable;
