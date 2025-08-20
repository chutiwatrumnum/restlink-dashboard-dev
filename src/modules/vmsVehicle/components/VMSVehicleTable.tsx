import { Table } from "antd";
import type {
  ColumnsType,
  TablePaginationConfig,
  TableProps,
} from "antd/es/table";
import { VehicleRecord } from "../../../stores/interfaces/Vehicle";

interface VMSVehicleTableType {
  columns: ColumnsType<VehicleRecord>;
  data: VehicleRecord[];
  onChangeTable: TableProps<VehicleRecord>["onChange"];
  PaginationConfig: TablePaginationConfig;
  loading: boolean;
}

const VMSVehicleTable = ({
  columns,
  data,
  loading,
  PaginationConfig,
  onChangeTable,
}: VMSVehicleTableType) => {
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
      className="vms-vehicle-table"
    />
  );
};

export default VMSVehicleTable;
