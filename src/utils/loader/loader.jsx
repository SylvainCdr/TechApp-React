// src/components/Loader/Loader.js
import React from "react";
import { HashLoader } from "react-spinners";
import styles from "./style.module.scss"; // Si tu veux le styliser avec SCSS

function Loader({ loading }) {
  return (
    <div className={styles.loaderContainer}>
      <HashLoader
        color={"#00fff7"} // La couleur du spinner
        loading={loading}
        size={80} // Taille du spinner
        margin = {15} // Marge entre les points
      
      />
    </div>
  );
}

export default Loader;
