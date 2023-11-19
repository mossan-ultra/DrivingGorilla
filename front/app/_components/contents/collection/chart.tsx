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
import { useContext } from "react";
import { WalletContext } from "@/app/context/wallet";
const DummyData = 8;
enum token {
  Driving,
  Safe,
  Eco,
  Distance,
  Refuling,
}

export const Chart = () => {
  const wallet = useContext(WalletContext);

  // ドライブで得た経験値を取得;
  const { amounts: driveTokens, isLoading: driveTokensIsLoading } =
    useDriveTokens(wallet.address as string);

  // 装備を取得
  const { equipments, isLoading: equipmentsIsLoading } = useEquipments(
    wallet.address as string
  );

  // 装備の各パラメータの装備を計算
  const equipmentParams = equipments.reduce(
    (equipmentParams, e) => {
      (equipmentParams.strength += e.driving),
        (equipmentParams.defence += e.safe),
        (equipmentParams.luck += e.eco),
        (equipmentParams.agility += e.distance),
        (equipmentParams.vitality += e.refuling);
      return equipmentParams;
    },
    {
      strength: 0,
      defence: 0,
      luck: 0,
      agility: 0,
      vitality: 0,
    }
  );

  console.log(driveTokens)
  // チャート用のデータを準備
  const chartData = [
    {
      subject: "STR",
      status: driveTokens[token.Driving] + equipmentParams.strength,
      dummy: DummyData,
    },
    {
      subject: "DEF",
      status: driveTokens[token.Safe] + equipmentParams.defence,
      dummy: DummyData,
    },
    {
      subject: "LUK",
      status: driveTokens[token.Eco] + equipmentParams.luck,
      dummy: DummyData,
    },
    {
      subject: "AGI",
      status: driveTokens[token.Distance] + equipmentParams.agility,
      dummy: DummyData,
    },
    {
      subject: "VIT",
      status: driveTokens[token.Refuling] + equipmentParams.vitality,
      dummy: DummyData,
    },
  ];

  return (
    <div className={classes.chartContainer}>
      <div className={classes.tableContainer}>
        {wallet.connected ? (
          <>
            {equipmentsIsLoading || driveTokensIsLoading ? (
              <div>Now Loading...</div>
            ) : (
              <>
                <div>
                  <div className={classes.paramTitle}>Parameters</div>
                  <ul className={classes.statusUl}>
                    {chartData.map((d) => (
                      <li className={classes.statusList} key={d.subject}>
                        <div className={classes.statusSubject}>{d.subject}</div>
                        <div className={classes.statusValue}>
                          {d.status.toLocaleString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </>
        ) : (
          <div>Not Connected</div>
        )}
      </div>
      <div className={classes.chartWrapper}>
        {equipmentsIsLoading || driveTokensIsLoading ? (
          <div>Now Loading...</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={chartData}>
              <PolarGrid />
              <PolarAngleAxis
                dataKey="subject"
                stroke="#00FFFF"
                strokeOpacity={0}
                tick={{ fontSize: 9 }}
              />
              <Radar
                name="Status"
                dataKey="status"
                stroke="#00FFFF"
                fill="#00FFFF"
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
        )}
      </div>
    </div>
  );
};
