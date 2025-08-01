import { Column } from "@ant-design/plots";

interface TooltipItem {
  type: string;
  value: number;
  color: string;
}

interface TooltipData {
  title: string;
  items: TooltipItem[];
}

interface ParcelDailyChartProps {
  color: string[];
  data: {
    date: string;
    value: number;
    type: string;
  }[];
}

const ParcelDailyChart = ({ color, data }: ParcelDailyChartProps) => {
  const config = {
    data,
    xField: "date",
    yField: "value",
    color: color,
    seriesField: "type",
    stack: true,
    columnStyle: {
      radius: [6, 6, 0, 0],
    },
    legend: {
      color: {
        position: "right",
      },
    },
    interaction: {
      tooltip: {
        render: (e: any, { title, items }: TooltipData) => {
          return (
            <div key={title}>
              <h4>{title}</h4>
              {items.map((item) => {
                return (
                  <div>
                    <div
                      style={{
                        margin: 0,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            display: "inline-block",
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            backgroundColor: item.color,
                            marginRight: 6,
                          }}
                        ></span>
                        <span>{item.type}</span>
                      </div>
                      <b>{item.value}</b>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        },
      },
    },
  };

  return <Column {...config} />;
};

export default ParcelDailyChart;
