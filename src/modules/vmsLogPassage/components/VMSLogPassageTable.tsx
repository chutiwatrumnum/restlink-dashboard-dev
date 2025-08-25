import { Table } from "antd";
import type {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/es/table";
import { LogPassageRecord } from "../../../stores/interfaces/LogPassage";

interface VMSLogPassageTableType {
  columns: ColumnsType<LogPassageRecord>;
  data: LogPassageRecord[];
  onChangeTable: TableProps<LogPassageRecord>["onChange"];
  PaginationConfig: TablePaginationConfig;
  loading: boolean;
}

const VMSLogPassageTable = ({
  columns,
  data,
  loading,
  PaginationConfig,
  onChangeTable,
}: VMSLogPassageTableType) => {
  const scroll: { x?: number | string } = {
    x: "max-content",
  };

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={scroll}
      onChange={onChangeTable}
      pagination={PaginationConfig}
      rowKey="id"
      className="vms-log-passage-table"
    />
  );
};

export default VMSLogPassageTable;
