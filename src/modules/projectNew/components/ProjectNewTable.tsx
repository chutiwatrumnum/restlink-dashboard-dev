import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { DataProjectNewType } from "../../../stores/interfaces/ProjectNew";

interface NormalTableType {
  columns: ColumnsType<DataProjectNewType>;
  data: DataProjectNewType[];
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
