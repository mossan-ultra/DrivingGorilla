import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import classes from "./status.module.css";

interface ChartOkigoriProps {
  StayStatusArray: number[];
}

export const ChartOkigori = (props: ChartOkigoriProps) => {
  const customSubjects = ["STR", "DEF", "LUK", "AGI", "VIT"];
  const data = props.StayStatusArray.map((value, index) => ({
    subject: customSubjects[index],
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis
          dataKey="subject"
          stroke="#FFF"
          strokeOpacity={0}
          tick={{ fontSize: 12 }}
        />
        <Radar
          name="value"
          dataKey="value"
          stroke="#00FFFF"
          fill="#00FFFF"
          fillOpacity={0.8}
        />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: "16px" }} />
      </RadarChart>
    </ResponsiveContainer>
  );
};
