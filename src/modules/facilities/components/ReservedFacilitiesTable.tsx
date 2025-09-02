import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { TableProps } from "antd";
import type { ReservedRowListDataType } from "../../../stores/interfaces/Facilities";

type Props = {
  columns: ColumnsType<ReservedRowListDataType>;
  data?: ReservedRowListDataType[];
  onChange?: TableProps<ReservedRowListDataType>["onChange"];
};

const ReservedFacilitiesTable = ({ columns, data, onChange }: Props) => {
  return (
    <Table<ReservedRowListDataType>
      style={{ whiteSpace: "nowrap" }}
      columns={columns}
      dataSource={data}
      scroll={{ x: "max-content" }}
      pagination={false}
      onChange={onChange}
    />
  );
};

export default ReservedFacilitiesTable;
