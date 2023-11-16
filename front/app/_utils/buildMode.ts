// ビルドモードを取得する
export enum BuildMode {
  Develop,
  Production,
}
export const buildMode = () => {
  switch (process.env.NODE_ENV) {
    case "development":
      return BuildMode.Develop;
    case "production":
    default:
      return BuildMode.Production;
  }
};
