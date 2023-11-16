import {
  Children,
  JSXElementConstructor,
  ReactElement,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  useState,
} from "react";
import { LessDepth } from "three";

type MapProps = google.maps.MapOptions & {
  style: { [key: string]: string };
  children?:
    | React.ReactElement<google.maps.MarkerOptions>[]
    | React.ReactElement<google.maps.MarkerOptions>;
};

export const Map: React.FC<MapProps> = ({ children, style, ...options }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map>();
  const [markerObjects, setMarkerObjects] =
    useState<ReactElement<any, string | JSXElementConstructor<any>>[]>();

  useEffect(() => {
    if (ref.current && !map) {
      const option = {
        center: options.center,
        zoom: 16,
        streetViewControl: false, // ストリートビューの操作を無効にする
        fullscreenControl: false, // 全画面表示を無効にする
      };
      const newMap = new window.google.maps.Map(ref.current, option);

      // マップ全体にクリックイベントを設定
      newMap.addListener("click", () => {
        // クリック時の処理
        console.log("マップがクリックされました_中のconsole");
      });

      setMap(newMap);
    }
  }, [ref, map]);

  const getMarker = (children: React.ReactElement) => {
    let chiledrens: ReactElement<
      google.maps.MarkerOptions,
      string | JSXElementConstructor<any>
    >[] = [];
    Children.forEach(children, (child, index) => {
      const isMarker = child.type.valueOf().toString().indexOf("Marker") > 0;
      if (isMarker) {
        chiledrens.push(child);
      }
      chiledrens = chiledrens.concat(getMarker(child.props.children));
    });
    return chiledrens;
  };

  useEffect(() => {
    const markerObjects = getMarker(children as React.ReactElement);
    setMarkerObjects(markerObjects);
  }, [children]);

  return (
    <>
      <div ref={ref} style={style} />
      {markerObjects &&
        markerObjects!.map((marker, index) => {
          return cloneElement(marker, { key: index, map });
        })}
    </>
  );
};
