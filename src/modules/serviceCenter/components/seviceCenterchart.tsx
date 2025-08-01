import { Pie, PieConfig } from '@ant-design/plots';
import { ChartPileServiceCenter } from '../../../stores/interfaces/ServiceCenter';

interface serviceCenterChartProps {
data:ChartPileServiceCenter[]
color:string[]
}
const serviceCenterChart= ({data,color}:serviceCenterChartProps) => {
    const config:PieConfig = {
        data,
        angleField: 'total',
        colorField: 'status',
        innerRadius: 0.6,
        color: color,
        // label: {
        //   text: 'value',
        //   style: {
        //     fontWeight: 'bold',
        //   },
        // },
        legend: {
          color: {
            title: false,
            position: 'right',
            rowPadding: 5,
          },
        },
        annotations: [
        //   {
        //     type: 'text',
        //     style: {
        //       text: 'AntV\nCharts',
        //       x: '50%',
        //       y: '50%',
        //       textAlign: 'center',
        //       fontSize: 40,
        //       fontStyle: 'bold',
        //     },
        //   },
        ],
      };
      return <Pie {...config} />;
}
export default serviceCenterChart