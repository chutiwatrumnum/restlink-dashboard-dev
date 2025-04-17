import { Table} from "antd";
import type { ColumnsType, TablePaginationConfig, TableProps } from "antd/es/table";
import {
  ResidentInformationDataType,
} from "../../../../stores/interfaces/ResidentInformation";
interface NormalTableType {
  columns: ColumnsType<ResidentInformationDataType>;
  data: ResidentInformationDataType[];
  onEdit: (data: ResidentInformationDataType) => void;
  onchangeTable:TableProps<ResidentInformationDataType>["onChange"];
  PaginationConfig:TablePaginationConfig;
  loading:boolean;
}

const ResidentInformationTable = ({
  columns,
  data,
  loading,
  PaginationConfig,
  onchangeTable
}: NormalTableType) => {
  const scroll: { x?: number | string } = {
    x: "90vw",
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

export default ResidentInformationTable;
