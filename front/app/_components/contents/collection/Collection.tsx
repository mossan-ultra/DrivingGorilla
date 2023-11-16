import parentClasses from "../contents.module.css";

export const Collection = () => (
  <div className={parentClasses.container}>
    <div className={parentClasses.window}>
      <h1 className={parentClasses.title} data-swiper-parallax="-300">
        Collection
      </h1>
      <p>コレクションです</p>
    </div>
  </div>
);
