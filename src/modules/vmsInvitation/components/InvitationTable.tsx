import { Table } from "antd";
import type {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/es/table";
import { InvitationRecord } from "../../../stores/interfaces/Invitation";

interface InvitationTableType {
  columns: ColumnsType<InvitationRecord>;
  data: InvitationRecord[];
  onChangeTable: TableProps<InvitationRecord>["onChange"];
  PaginationConfig: TablePaginationConfig;
  loading: boolean;
}

const InvitationTable = ({
  columns,
  data,
  loading,
  PaginationConfig,
  onChangeTable,
}: InvitationTableType) => {
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
      className="vms-invitation-table"
    />
  );
};

export default InvitationTable;
