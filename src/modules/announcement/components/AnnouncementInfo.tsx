import { useState, useEffect } from "react";
import { Modal, Row, Image, Space } from "antd";
import dayjs from "dayjs";

import { AnnounceFormDataType } from "../../../stores/interfaces/Announcement";

type AnnouncementInfoModalType = {
  isInfoModalOpen: boolean;
  onCancel: () => void;
  data: AnnounceFormDataType;
};

const AnnouncementInfoModal = ({
  isInfoModalOpen,
  onCancel,
  data,
}: AnnouncementInfoModalType) => {
  const [open, setOpen] = useState(false);

  const onClose = () => {
    onCancel();
  };

  useEffect(() => {
    // console.log("DATA => ", data);
    setOpen(isInfoModalOpen);
  }, [isInfoModalOpen]);

  return (
    <>
      <Modal
        className={"announcementInfoModal"}
        width={"65%"}
        open={open}
        title="Details"
        onCancel={onClose}
        footer={null}
        centered={true}
        forceRender={true}
      >
        <Row className="announcementInfoRow" justify={"space-between"}>
          <div className="announcementInfoColumn">
            <Space
              direction="vertical"
              size="small"
              style={{ display: "flex" }}
            >
              <span>Image</span>
              <Image
                style={{ maxHeight: 400, objectFit: "contain" }}
                width={"100%"}
                src={data.imageUrl ?? ""}
              />
            </Space>
          </div>
          <div className="announcementInfoColumn">
            <b>Title</b>
            <p>{data.title}</p>
            <b>Description</b>
            <p>{data.description}</p>
            <Row justify={"space-between"}>
              <div className="announcementInfoDetailsColumn">
                <b>Created date</b>
                <p>{dayjs(data.createdAt).format("DD/MM/YYYY")}</p>
              </div>
              <div className="announcementInfoDetailsColumn">
                <b>Created by</b>
                <p>{`${data.createBy?.firstName} ${data.createBy?.middleName} ${data.createBy?.lastName}`}</p>
              </div>
              <div className="announcementInfoDetailsColumn">
                <b>Start date/Time</b>
                <p>{dayjs(data.startDate).format("DD/MM/YYYY : HH:mm")}</p>
              </div>
              <div className="announcementInfoDetailsColumn">
                <b>End date/Time</b>
                <p>{dayjs(data.endDate).format("DD/MM/YYYY : HH:mm")}</p>
              </div>
            </Row>
            <b>Status</b>
            <p>
              {dayjs().isBefore(data.endDate) && dayjs().isAfter(data.startDate)
                ? "Published"
                : "Unpublished"}
            </p>
          </div>
        </Row>
      </Modal>
    </>
  );
};

export default AnnouncementInfoModal;
