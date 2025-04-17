import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { DataAnnouncementType } from "../../../stores/interfaces/Announcement";

interface NormalTableType {
  columns: ColumnsType<DataAnnouncementType>;
  data: DataAnnouncementType[];
}

const AnnounceTable = ({ columns, data }: NormalTableType) => {
  return (
    <Table
      style={{ whiteSpace: "nowrap" }}
      columns={columns}
      dataSource={data}
      scroll={{ x: "100%" }}
      pagination={false}
    />
  );
};

export default AnnounceTable;
