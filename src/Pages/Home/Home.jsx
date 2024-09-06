import styles from "./style.module.scss";
// import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Homepage() {
  return (
    <div className={styles.homepageContainer}>
      <img src="assets/logo-pix-dark.png" alt="" />
      <h1>Tech-App</h1>

      <div className={styles.categories}>
        <Link to="/page2">Fiches missions</Link>
        <Link to="/page3">Rapports d'interventions</Link>
        <Link to="/page4">Fiches incidents</Link>
      </div>
    </div>
  );
}

export default Homepage;
