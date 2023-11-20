import { useDriveTokens } from "@/app/_hooks/useDriveTokens";
import { useEquipments } from "@/app/_hooks/useEquipments";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import classes from "./collectionStyle.module.css";


const DummyData = 8;
// Okigori プロパティの型定義
interface OkigoriProps {
  Driving: number;
  Safe: number;
  Eco: number;
  Distance: number;
  Refuling: number;
}

enum token {
  Driving,
  Safe,
  Eco,
  Distance,
  Refuling,
}

export const ChartOkigoriModal: React.FC<OkigoriProps> = (props) => {
  // チャート用のデータを準備
  const chartData = [
    {
      subject: "STR",
      base: props.Driving,
      dummy: DummyData,
    },
    {
      subject: "DEF",
      base: props.Safe,
      dummy: DummyData,
    },
    {
      subject: "LUK",
      base: props.Eco,
      dummy: DummyData,
    },
    {
      subject: "AGI",
      base: props.Distance,
      dummy: DummyData,
    },
    {
      subject: "VIT",
      base: props.Driving,
      dummy: DummyData,
    },
  ];

  return (
    <div className={classes.chartContainer}>
      <div className={classes.tableContainer}>
        <>
          <div>
            <div className={classes.paramTitle}>Parameters</div>
            <ul className={classes.statusUl}>
              {chartData.map((d) => (
                <li className={classes.statusList} key={d.subject}>
                  <div className={classes.statusSubject}>{d.subject}</div>
                  <div className={classes.statusValue}>
                    {d.base.toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </>
      </div>
      <div className={classes.chartWrapper}>
        <ResponsiveContainer width="100%" height={220}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis
              dataKey="subject"
              stroke="#FF0000"
              strokeOpacity={0}
              tick={{ fontSize: 9 }}
            />
            <Radar
              name="Status"
              dataKey="base"
              stroke="#FF0000"
              fill="#FF0000"
              fillOpacity={0.8}
            />
            <Radar
              name=" "
              dataKey="dummy"
              stroke="rgba(255, 0, 0, 0)"
              fill="rgba(255, 0, 0, 0)"
              fillOpacity={0.8}
            />
            <Legend wrapperStyle={{ fontSize: "16px" }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


export default ChartOkigoriModal