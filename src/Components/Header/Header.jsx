import React, { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import Logout from "../logout/logout";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase"; // Ton fichier de config Firebase

function Header() {
  const [user, setUser] = useState(null); // État pour suivre si un utilisateur est connecté

  // Surveille l'état de connexion de l'utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Met à jour l'état avec l'utilisateur connecté ou null s'il est déconnecté
    });

    // Cleanup: désinscrire l'observateur lors du démontage du composant
    return () => unsubscribe();
  }, []);

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
        <NavLink to="/home" onClick={handleLinkClick}>
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

          {/* Affiche le bouton de déconnexion uniquement si un utilisateur est connecté */}
          {user && (
            <p>
              <Logout />
            </p>
          )}
        </ul>
        <div className={styles.header__burgerMenu} onClick={burgerToggle} />
      </nav>
    </div>
  );
}

export default Header;
