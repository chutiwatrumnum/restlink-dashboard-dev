import { Table} from "antd";
import type { ColumnsType, TablePaginationConfig, TableProps } from "antd/es/table";
import {
  ManagementDataType
} from "../../../stores/interfaces/Management";
interface NormalTableType {
  columns: ColumnsType<ManagementDataType>;
  data: ManagementDataType[];
  onchangeTable:TableProps<ManagementDataType>["onChange"];
  PaginationConfig:TablePaginationConfig;
  loading:boolean;
}

const ManagementTable = ({
  columns,
  data,
  PaginationConfig,
  loading
,onchangeTable}: NormalTableType) => {
  const scroll: { x?: number | string } = {
    x: "10vw",
  };
  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={scroll}
      onChange={onchangeTable}
     pagination={PaginationConfig}
    />
  );
};

export default ManagementTable;
