import { useState, useEffect } from "react";
import { Modal, Row, Col, Typography, List } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Dispatch, RootState } from "../../../stores";

interface DataType {
  blockNo: string;
  unit: Unit[];
}

interface Unit {
  unitNo: string;
}
interface ComponentCreateProps {
  isOpen: boolean;
  data: DataType[];
  onCancel: Function;
}

const { Title, Text } = Typography;
const UnitInfoModal = ({
  isOpen = false,
  data,
  onCancel,
}: ComponentCreateProps) => {
  const dispatch = useDispatch<Dispatch>();
  return (
    <>
      <Modal
        title="Unit info"
        width={700}
        centered
        open={isOpen}
        onCancel={() => {
          onCancel();
        }}
        footer={null}
        bodyStyle={{ overflowY: "auto", maxHeight: 600 }}
      >
        <Row>
          {data.map((dataItem) => {
            return (
              <>
                <Col span={24 / data.length}>
                  <Text className="unitTitle">{dataItem.blockNo}</Text>
                  <List
                    grid={{ gutter: 5, column: 6 / data.length }}
                    dataSource={dataItem.unit}
                    renderItem={(item) => (
                      <List.Item>
                        <Text>{item.unitNo}</Text>
                      </List.Item>
                    )}
                    className="listContainer"
                  />
                </Col>
              </>
            );
          })}
        </Row>
      </Modal>
    </>
  );
};

export default UnitInfoModal;
