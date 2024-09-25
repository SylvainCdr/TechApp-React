import React, { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { NavLink } from "react-router-dom";
import Logout from "../logout/logout";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import Loader from "../../utils/loader/loader";

function Header() {
  const [user, setUser] = useState(null); // État pour suivre si un utilisateur est connecté
  const [menuOpen, setMenuOpen] = useState(false); // État pour contrôler le menu burger


  // Surveille l'état de connexion de l'utilisateur
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Met à jour l'état avec l'utilisateur connecté ou null s'il est déconnecté
    });

    // Cleanup: désinscrire l'observateur lors du démontage du composant
    return () => unsubscribe();
  }, []);

  // Gère l'ouverture et la fermeture du menu burger
  const burgerToggle = () => {
    setMenuOpen(!menuOpen);
  };

  // Gère la fermeture du menu lorsque l'utilisateur clique sur un lien
  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  // Ferme le menu si on clique en dehors
  useEffect(() => {
    const handleOutsideClick = (event) => {
      const nav = document.querySelector(`.${styles.nav}`);
      if (menuOpen && nav && !nav.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [menuOpen]);

  return (
    <div className={styles.headerContainer}>
      <nav className={`${styles.nav} ${menuOpen ? styles.active : ""}`}>
      <NavLink to="/" onClick={handleLinkClick}>
  <img
    src="assets/pix-techapp.png"
    alt="ACCUEIL"
    className={styles.logo}
    loading="lazy"
    
  />
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

          {/* Affiche le bouton de déconnexion et l'icône toggle-on uniquement si un utilisateur est connecté */}
          {user ? (
            <>
              <li><Logout /></li>
            </>
          ) : (
            <li className={styles.toggleOff}>
              <i className="fa-solid fa-toggle-off"></i>
            </li>
          )}
        </ul>
        <div
          className={`${styles.header__burgerMenu} ${menuOpen ? styles.active : ""}`}
          onClick={burgerToggle}
        />
      </nav>
    </div>
  );
}

export default Header;
