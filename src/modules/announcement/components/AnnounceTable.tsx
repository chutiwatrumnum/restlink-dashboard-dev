import { Table } from "antd";

import type { ColumnsType } from "antd/es/table";
import { DataAnnouncementType } from "../../../stores/interfaces/Announcement";

interface NormalTableType {
  columns: ColumnsType<DataAnnouncementType>;
  data: DataAnnouncementType[];
}

const AnnounceTable = ({ columns, data }: NormalTableType) => {
   const scroll: { x?: number | string } = {
     x: 1500, // ปรับค่าตามความกว้างรวมของคอลัมน์
   };
  return (
    <Table
      style={{ whiteSpace: "nowrap" }}
      columns={columns}
      dataSource={data}
      scroll={scroll}
      pagination={false}
    />
  );
};

export default AnnounceTable;
