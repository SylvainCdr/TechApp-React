import { motion } from "framer-motion";
import styles from "./style.module.scss";
import { Link } from "react-router-dom";

const container = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.3,
      staggerChildren: 0.2
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
  return (
    <motion.div
      className={styles.homepageContainer}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {/* Animation spéciale pour l'image */}
      <motion.img
        src="assets/logo-pix-dark.png"
        alt=""
        initial={{ scale: 0 }}
        animate={{ rotate: 360, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20
        }}
      />
      
      {/* Animation normale pour le titre */}
      <motion.h1 variants={item}>Tech-App</motion.h1>

      {/* Animation des liens */}
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
