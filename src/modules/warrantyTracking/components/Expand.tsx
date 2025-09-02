import { warrantyDetailsData } from "../dummyData/TableDetail";
import { WarrantyDetailsType } from "../../../stores/interfaces/Warranty";
import type { TableColumnsType } from "antd";
import { EditIcon, TrashIcon } from "../../../assets/icons/Icons";
import { Button, Row, Col, Table } from "antd";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
interface ExpandTableProps {
  handleEdit: (record: WarrantyDetailsType) => void;
}

export const ExpandedRowRender = (props: ExpandTableProps) => {
  let data: WarrantyDetailsType[] = warrantyDetailsData;
  const onEdit = (record: WarrantyDetailsType) => {
    const warrantyDetails: WarrantyDetailsType = {
      ...record,
      createdAt: record.createdAt || new Date().toISOString()
    };
    props.handleEdit(warrantyDetails);
  };

  const onDelete = async (record: WarrantyDetailsType) => {
    await ConfirmModal({
      message: "Confirm deletion",
      title: "Confirm deleting this device warranty",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        await new Promise((resolve) => {
          setTimeout(resolve, 300);
        });
        SuccessModal("ลบการรับรองอุปกรณ์สำเร็จ");
      }
    });
  };

  const columns: TableColumnsType<WarrantyDetailsType> = [
    {
      title: "No.",
      dataIndex: "key",
      key: "key",
      align: "center",
    },
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      align: "center",
      render: (_, record) => (
        <div className="flex justify-center items-center">
          <img 
            src={record.image} 
            alt="image" 
            className="w-50 h-30 rounded-md object-cover" 
          />
        </div>
      )
    },
    {
      title: "Warranty Name",
      dataIndex: "warrantyName",
      key: "warrantyName",
      align: "center",
    },
    {
      title: "Serial Number",
      dataIndex: "serialNumber",
      key: "serialNumber",
      align: "center",
    },
    {
      title: "Purchase Date",
      dataIndex: "purchaseDate",
      key: "purchaseDate",
      align: "center",
    },
    {
      title: "Expire Date",
      dataIndex: "expireDate",
      key: "expireDate",
      align: "center",
    },
    {
      title: "Action",
      dataIndex: "createdAt",
      key: "createdAt",
      align: "center",
      render: (_, record) => (
        <>
          <Row>
            <Col span={24}>
              <Button
                type="text"
                icon={<EditIcon />}
                onClick={() => onEdit(record)}
              />
              <Button
                onClick={() => onDelete(record)}
                type="text"
                icon={<TrashIcon />}
              />
            </Col>
          </Row>
        </>
      )
    }
  ];

  const scroll = { x: "max-content" };

  return <Table 
    columns={columns} 
    dataSource={data} 
    pagination={false}
    scroll={scroll}
  />;
};
