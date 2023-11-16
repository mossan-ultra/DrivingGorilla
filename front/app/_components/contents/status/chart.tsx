import { useDriveTokens } from "@/app/_hooks/useDriveTokens";
import { useEquipments } from "@/app/_hooks/useEquipments";
import {
  walletAddressAtom,
  walletConnectionAtom,
} from "@/app/_recoil/atoms/web3";
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { useRecoilValue } from "recoil";
import classes from "./status.module.css";

enum token {
  Driving,
  Safe,
  Eco,
  Distance,
  Refuling,
}

export const Chart = () => {
  const walletAddress = useRecoilValue(walletAddressAtom);
  const isWalletConnected = useRecoilValue(walletConnectionAtom);

  //ドライブで得た経験値を取得;
  const { amounts: driveTokens, isLoading: driveTokensIsLoading } =
    useDriveTokens(walletAddress);

  // 装備を取得
  const { equipments, isLoading: equipmentsIsLoading } =
    useEquipments(walletAddress);

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

  // チャート用のデータを準備
  const chartData = [
    {
      subject: "STR",
      base: driveTokens[token.Driving],
      equip: equipmentParams.strength,
    },
    {
      subject: "DEF",
      base: driveTokens[token.Safe],
      equip: equipmentParams.defence,
    },
    {
      subject: "LUK",
      base: driveTokens[token.Eco],
      equip: equipmentParams.luck,
    },
    {
      subject: "AGI",
      base: driveTokens[token.Distance],
      equip: equipmentParams.agility,
    },
    {
      subject: "VIT",
      base: driveTokens[token.Refuling],
      equip: equipmentParams.vitality,
    },
  ];

  return (
    <>
      {isWalletConnected ? (
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
                        {(d.base + d.equip).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="#FFF"
                    strokeOpacity={0}
                    tick={{ fontSize: 12 }}
                  />
                  <Radar
                    name="base"
                    dataKey="base"
                    stroke="#00FFFF"
                    fill="#00FFFF"
                    fillOpacity={0.8}
                  />
                  <Radar
                    name="equip"
                    dataKey="equip"
                    stroke="#FF7979"
                    fill="#FF7979"
                    fillOpacity={0.8}
                  />
                  <Legend wrapperStyle={{ fontSize: "16px" }} />
                </RadarChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      ) : (
        <div>Not Connected</div>
      )}
    </>
  );
};
