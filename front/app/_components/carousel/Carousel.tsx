// Import Swiper React components
import SwiperType from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import bg from "../../../public/images/background2.png";
import "./styles.css";

// import required modules
import { Parallax } from "swiper/modules";
import { Collection, Drive, Equipments, Home, Status } from "../contents";
import { useState } from "react";
import { BuildMode, buildMode } from "@/app/_utils/buildMode";

type MyComponentProps = {
  onSwiperChange: (swiper: SwiperType) => void;
};

const components = [Drive, Status, Home, Collection, Equipments];

export default function Carousel({ onSwiperChange }: MyComponentProps) {
  const [isLoadComplete, setIsLoadComplete] = useState(false);
  let initCount = 0;

  // 初回レンダリング時は0番目のインデックスが表示されてしまう。
  // インデックス２を初期画面としたいのでonAfterInitを確認してからコンポーネントを表示する
  // （ビルドモードによってスライド２に切り替わるまでのafterInitイベントの数が異なる）
  const onAfterInit = () => {
    if (isLoadComplete) {
      return;
    }
    let limit = 0;
    if (buildMode() === BuildMode.Develop) {
      limit = 2;
    } else {
      limit = 1;
    }

    initCount++;
    if (initCount >= limit) {
      setIsLoadComplete(true);
    }
  };
  return (
    <>
      <Swiper
        onSwiper={(sw) => onSwiperChange(sw)}
        speed={600}
        parallax={true}
        initialSlide={2}
        modules={[Parallax]}
        className="mySwiper"
        onAfterInit={(swiper) => onAfterInit()}
      >
        <div
          slot="container-start"
          className="parallax-bg"
          style={{
            backgroundImage: `url(${bg.src})`,
          }}
          data-swiper-parallax="-23%"
        ></div>

        {components.map((Component, i) => (
          <SwiperSlide key={i}>{isLoadComplete && <Component />}</SwiperSlide>
        ))}
      </Swiper>
    </>
  );
}
