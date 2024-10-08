// src/components/Loader/Loader.js
import React from "react";
import { HashLoader } from "react-spinners";
import styles from "./style.module.scss"; // Si tu veux le styliser avec SCSS

function Loader({ loading }) {
  return (
    <div className={styles.loaderContainer}>
      <HashLoader color={"#00fff7"} loading={loading} size={80} />
    </div>
  );
}

export default Loader;
