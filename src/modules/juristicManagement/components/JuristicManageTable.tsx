import { Table } from "antd";
import type {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/es/table";
import { JuristicManageDataType } from "../../../stores/interfaces/JuristicManage";
interface NormalTableType {
  columns: ColumnsType<JuristicManageDataType>;
  data: JuristicManageDataType[];
  onEdit: (data: JuristicManageDataType) => void;
  onchangeTable: TableProps<JuristicManageDataType>["onChange"];
  PaginationConfig: TablePaginationConfig;
  loading: boolean;
}

const JuristicManageTable = ({
  columns,
  data,
  loading,
  PaginationConfig,
  onchangeTable,
}: NormalTableType) => {
  const scroll: { x?: number | string } = {
    x: "max-content",
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

export default JuristicManageTable;
