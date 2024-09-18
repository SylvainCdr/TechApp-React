// components/Login.js
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import Swal from "sweetalert2";
import styles from "./style.module.scss";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.5,
      staggerChildren: 0.2,
    },
  },
};

const item = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirige l'utilisateur après la connexion
   
      
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <motion.div
      className={styles.loginContainer}
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
          damping: 20,
        }}
      />

      {/* Animation normale pour le titre */}
      <motion.h1 variants={item}>Tech-App</motion.h1>

      <motion.h2 variants={item}>Connexion</motion.h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <motion.form onSubmit={handleSubmit} variants={item}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">
          <i class="fa-solid fa-right-to-bracket"></i>
        </button>
      </motion.form>
    </motion.div>
  );
}
