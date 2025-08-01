import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { AdminTableDataType } from "../../../stores/interfaces/Setting";

interface NormalTableType {
  columns: ColumnsType<AdminTableDataType>;
  data: AdminTableDataType[];
}

const AdminManagementTable = ({ columns, data }: NormalTableType) => {
  return (
    <Table
      columns={columns}
      dataSource={data}
      scroll={{ x: "100%" }}
      pagination={false}
    />
  );
};

export default AdminManagementTable;
