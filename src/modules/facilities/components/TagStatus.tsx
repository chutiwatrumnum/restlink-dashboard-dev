import { Tag } from "antd";
import { ReservedStatusType } from "../../../stores/interfaces/Facilities";

const TagStatus = (props: ReservedStatusType) => {
  const { nameCode, nameEn } = props;
  const colorStatus = () => {
    switch (nameCode) {
      case "reserved":
        return "blue";
        break;
      case "expired":
        return "warning";
        break;
      case "activated":
        return "blue";
        break;
      case "completed":
        return "success";
        break;
      case "cancel":
        return "error";
        break;
      default:
        break;
    }
  };

  return <Tag color={colorStatus()}>{nameEn}</Tag>;
};

export default TagStatus;
