import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { ReservedRowListDataType } from "../../../stores/interfaces/Facilities";

interface NormalTableType {
  columns: ColumnsType<ReservedRowListDataType>;
  data?: ReservedRowListDataType[];
}

const ReservedFacilitiesTable = ({ columns, data }: NormalTableType) => {
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

export default ReservedFacilitiesTable;
