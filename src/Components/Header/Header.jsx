import React from "react";
import styles from "./style.module.scss";
import { NavLink } from "react-router-dom";

function Header() {
  const burgerToggle = () => {
    const nav = document.querySelector(`.${styles.nav}`);
    const burgerMenu = document.querySelector(`.${styles.header__burgerMenu}`);
    nav.classList.toggle(styles.active);
    burgerMenu.classList.toggle(styles.active);
  };

  const handleLinkClick = () => {
    const nav = document.querySelector(`.${styles.nav}`);
    const burgerMenu = document.querySelector(`.${styles.header__burgerMenu}`);
    nav.classList.remove(styles.active);
    burgerMenu.classList.remove(styles.active);
  };

  return (
    <div className={styles.headerContainer}>
      <nav className={styles.nav}>
        <ul className={styles.navUl}>
          <li className={styles.navLi}>
            <NavLink to="/" onClick={handleLinkClick}>
              <img src="assets/logo-pix-dark.png" alt="Logo" className="logo" />
            </NavLink>
          </li>
          <li className={styles.navLi}>
            <NavLink to="/missions" onClick={handleLinkClick}>
              Fiches missions
            </NavLink>
          </li>
          <li className={styles.navLi}>
            <NavLink to="/reports" onClick={handleLinkClick}>
              Rapports d'intervention
            </NavLink>
          </li>
          <li className={styles.navLi}>
            <NavLink to="/incidents" onClick={handleLinkClick}>
              Fiches incidents
            </NavLink>
          </li>
          <li className={styles.navLi}>
            <NavLink to="/tech" onClick={handleLinkClick}>
              Techniciens
            </NavLink>
          </li>
        </ul>
        <div className={styles.header__burgerMenu} onClick={burgerToggle} />
      </nav>
    </div>
  );
}

export default Header;
