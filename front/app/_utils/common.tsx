// 共通的に使えるやつ
// 共通的とは...みたいな話もあるが、そういうのは後でする

// base64で帰ってきたデータを変換する関数
export const base64Decode = (text: string) =>
  fetch(text).then((response) => response.text());
