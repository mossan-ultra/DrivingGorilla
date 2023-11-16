import parentClasses from "../contents.module.css";
import { Chart } from "./chart";
import { Ranking } from "./ranking";
import classes from "./status.module.css";

export const Status = () => (
  <div className={parentClasses.container}>
    <div className={parentClasses.window}>
      <h1 className={parentClasses.title} data-swiper-parallax="-300">
        Status
      </h1>
      <div className={classes.chartOuter}>
        <Chart />
      </div>

      <h1 className={parentClasses.title} data-swiper-parallax="-300">
        Ranking
      </h1>

      <div className={classes.chartOuter}>
        <Ranking />
      </div>
    </div>
  </div>
);
