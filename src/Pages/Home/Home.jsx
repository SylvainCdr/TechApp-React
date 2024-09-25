import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Loader from "../../utils/loader/loader";
import styles from "./style.module.scss";


const container = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.4,
      staggerChildren: 0.3
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

function Homepage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false); // Termine le chargement après 2 secondes
    }, 1700);
    return () => clearTimeout(timer);
  }, []);
  if (loading) {
    return <Loader loading={loading} />; // Affiche le loader pendant le chargement
  }

  return (
   





<motion.div
      className={styles.homepageContainer}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Animation spéciale pour l'image */}
      <motion.img
        src="assets/pix-techapp3.png"
        alt=""
        initial={{ scale: 0 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      />





      <motion.div className={styles.categories} variants={container}>
        <motion.div variants={item}>
          <Link to="/missions">Fiches missions</Link>
        </motion.div>
        <motion.div variants={item}>
          <Link to="/reports">Rapports d'interventions</Link>
        </motion.div>
        <motion.div variants={item}>
          <Link to="/incidents">Fiches incidents</Link>
        </motion.div>
        <motion.div variants={item}>
          <Link to="/tech">Techniciens</Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Homepage;
