import Swiper from "swiper";
import classes from "./footer.module.css";

const menuList = [
  { name: "Drive", img: "drive", link: "drive" },
  { name: "Status", img: "status", link: "status" },
  { name: "Home", img: "home", link: "" },
  { name: "Collection", img: "goricolle", link: "goricolle" },
  { name: "Equipments", img: "equipments", link: "equipments" },
];

interface Props {
  swiper: Swiper | null;
}

export const Footer = ({ swiper }: Props) => {
  const goToSlide = (index: number) => {
    if (swiper) {
      swiper.slideTo(index);
    }
  };

  return (
    <footer className={classes.footer}>
      <ul className={classes.footer_ul}>
        {menuList.map((m, i) => (
          <li key={i}>
            <ul>
              <li>
                <button
                  className={classes[`button_link_${m.img}`]}
                  onClick={() => goToSlide(i)}
                />
              </li>
              <li>{m.name}</li>
            </ul>
          </li>
        ))}
      </ul>
    </footer>
  );
};
