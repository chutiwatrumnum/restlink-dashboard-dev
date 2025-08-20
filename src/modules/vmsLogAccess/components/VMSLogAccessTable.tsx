// ไฟล์: src/modules/vmsLogAccess/components/VMSLogAccessTable.tsx

import { Table } from "antd";
import type {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/es/table";
import { LogAccessRecord } from "../../../stores/interfaces/LogAccess";

interface VMSLogAccessTableType {
  columns: ColumnsType<LogAccessRecord>;
  data: LogAccessRecord[];
  onChangeTable: TableProps<LogAccessRecord>["onChange"];
  PaginationConfig: TablePaginationConfig;
  loading: boolean;
}

const VMSLogAccessTable = ({
  columns,
  data,
  loading,
  PaginationConfig,
  onChangeTable,
}: VMSLogAccessTableType) => {
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
      className="vms-log-access-table"
    />
  );
};

export default VMSLogAccessTable;
