import parentClasses from "../contents.module.css";
import { Chart } from "./chart";
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
    </div>
  </div>
);
