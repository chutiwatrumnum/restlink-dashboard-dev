// File: src/modules/vmsVisitor/components/VMSVisitorTable.tsx

import { Table } from "antd";
import type {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/es/table";
import { VMSVisitorRecord } from "../../../stores/interfaces/VMSVisitor";

interface VMSVisitorTableType {
  columns: ColumnsType<VMSVisitorRecord>;
  data: VMSVisitorRecord[];
  onChangeTable: TableProps<VMSVisitorRecord>["onChange"];
  PaginationConfig: TablePaginationConfig;
  loading: boolean;
}

const VMSVisitorTable = ({
  columns,
  data,
  loading,
  PaginationConfig,
  onChangeTable,
}: VMSVisitorTableType) => {
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
      className="vms-visitor-table"
    />
  );
};

export default VMSVisitorTable;
