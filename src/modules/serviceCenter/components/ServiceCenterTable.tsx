import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { ServiceCenterDataType} from "../../../stores/interfaces/ServiceCenter";


interface NormalTableType {
  columns: ColumnsType<ServiceCenterDataType>;
  data: ServiceCenterDataType[];
  loading:boolean
}

const ServiceCenterTable = ({ columns, data,loading }: NormalTableType) => {
  return (
    <Table
      style={{ whiteSpace: "nowrap" }}
      columns={columns}
      dataSource={data}
      loading={loading}
      scroll={{ x: "100%" }}
      pagination={false}
    />
  );
};

export default ServiceCenterTable;
