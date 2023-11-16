import { useState, useEffect } from "react";

type MarkerProps = google.maps.MarkerOptions & {
  key: string;
  url: string;
  onClick?: () => void; // 追加：クリック時の処理
};

export const Marker: React.FC<MarkerProps> = ({
  key,
  url,
  onClick,
  ...options
}) => {
  const [marker, setMarker] = useState<google.maps.Marker>();

  useEffect(() => {
    const a: google.maps.MarkerOptions = {};

    if (!marker) {
      setMarker(new google.maps.Marker());
    }

    // remove marker from map on unmount
    return () => {
      if (marker) {
        marker.setMap(null);
      }
    };
  }, [marker]);

  useEffect(() => {
    if (marker) {
      //呼び出し元でgoogle.mapsの定義が使えないので、ここでoptionを生成する。
      //使えない理由は不明
      let newOption = { ...options };

      newOption.icon = {
        url: url,
        scaledSize: new google.maps.Size(30, 30),
      };

      marker.setOptions(newOption);
    }
  }, [marker, options, url]);
  useEffect(() => {
    if (marker && onClick) {
      // マーカーが存在し、クリック時の処理が指定されている場合、クリックイベントリスナーを追加
      marker.addListener("click", onClick);
    }
  }, [marker, onClick]);

  return null;
};
