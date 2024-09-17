import React from "react";
import styles from "./style.module.scss";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

function Header() {
  const variants = {
    open: { opacity: 1, x: 0 },
    closed: { opacity: 0, x: "-100%" },
  };

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
        <NavLink to="/" onClick={handleLinkClick}>
          <img src="assets/techapp-logo3.png" alt="ACCUEIL" className={styles.logo} />
        </NavLink>
        <ul className={styles.navUl}>
          <li className={styles.navLi}>
            <NavLink
              to="/missions"
              onClick={handleLinkClick}
              className={({ isActive }) => (isActive ? styles.activeLink : "")}
            >
              Fiches missions
            </NavLink>
          </li>
          <li className={styles.navLi}>
            <NavLink
              to="/reports"
              onClick={handleLinkClick}
              className={({ isActive }) => (isActive ? styles.activeLink : "")}
            >
              Rapports d'intervention
            </NavLink>
          </li>
          <li className={styles.navLi}>
            <NavLink
              to="/incidents"
              onClick={handleLinkClick}
              className={({ isActive }) => (isActive ? styles.activeLink : "")}
            >
              Fiches incidents
            </NavLink>
          </li>
          <li className={styles.navLi}>
            <NavLink
              to="/tech"
              onClick={handleLinkClick}
              className={({ isActive }) => (isActive ? styles.activeLink : "")}
            >
              Techniciens
            </NavLink>
          </li>
          <li className={styles.navLi}>
            <NavLink
              to="/search"
              onClick={handleLinkClick}
              className={({ isActive }) => (isActive ? styles.activeLink : "")}
            >
              <i className="fa-solid fa-magnifying-glass"></i>
            </NavLink>
          </li>
        </ul>
        <div className={styles.header__burgerMenu} onClick={burgerToggle} />
      </nav>
    </div>
  );
}

export default Header;
