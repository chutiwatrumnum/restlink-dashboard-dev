import { Pie } from "@ant-design/plots";
const ParcelStatusChart = ({ data, color }: any) => {
  const config = {
    data,
    angleField: "value",
    colorField: "type",
    color: color,
    label: {
      text: "value",
      style: {
        fontWeight: "bold",
        position: "inside",
      },
    },
    legend: {
      color: {
        title: false,
        position: "right",
        rowPadding: 5,
      },
    },
  };
  return <Pie {...config} />;
};

export default ParcelStatusChart;
