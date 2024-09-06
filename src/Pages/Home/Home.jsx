import styles from "./style.module.scss";
// import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Homepage() {
  return (
    <div className={styles.homepageContainer}>
      <img src="assets/logo-pix-dark.png" alt="" />
      <h1>Tech-App</h1>

      <div className={styles.categories}>
        <Link to="/missions">Fiches missions</Link>
        <Link to="/reports">Rapports d'interventions</Link>
        <Link to="/incidents">Fiches incidents</Link>
      </div>
    </div>
  );
}

export default Homepage;
