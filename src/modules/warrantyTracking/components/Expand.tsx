import { WarrantyDetailsType } from "../../../stores/interfaces/Warranty";
import type { TableColumnsType } from "antd";
import { EditIcon, TrashIcon } from "../../../assets/icons/Icons";
import { Button, Row, Col, Table } from "antd";
import ConfirmModal from "../../../components/common/ConfirmModal";
import SuccessModal from "../../../components/common/SuccessModal";
import { deleteWarrantyTracking } from "../service/api/WarrantyTracking";
import FailedModal from "../../../components/common/FailedModal";
import { useWarrantyTracking } from "../Contaxt";
interface ExpandTableProps {
  handleEdit: (record: WarrantyDetailsType) => void;
  dataRecord: any;
  setSelectedWarranty: (warranty: WarrantyDetailsType) => void;
  loadFirst: (overrideSearch?: any) => Promise<void>;
}

export const ExpandedRowRender = (props: ExpandTableProps) => {
  const data: any = props.dataRecord?.expand || [];
  let recordRow = props.dataRecord;
  const loadFirst = props.loadFirst;
  const { setIsEditMode } = useWarrantyTracking();
  const onEdit = (record: WarrantyDetailsType) => {
    setIsEditMode(true);
    const warrantyDetails: WarrantyDetailsType = {
      ...record,
      owner: recordRow?.owner,
      address: recordRow?.address,
      createdAt: record.createdAt || new Date().toISOString()
    };
    props.handleEdit(warrantyDetails);
  };

  const onDelete = async (id:string) => {
    await ConfirmModal({
      message: "Confirm deletion",
      title: "Confirm deleting this device warranty",
      okMessage: "Confirm",
      cancelMessage: "Cancel",
      onOk: async () => {
        let deleteWarranty = await deleteWarrantyTracking(id);
        if(deleteWarranty.status){
          // SuccessModal("ลบการรับรองอุปกรณ์สำเร็จ");
          loadFirst();
          await new Promise((resolve) => {
            setTimeout(resolve, 300);
          });
          SuccessModal("Device warranty deleted successfully");
        }else{
          FailedModal("Failed to delete warranty tracking");
        }

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
                onClick={() => onDelete(record.id || '')}
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
