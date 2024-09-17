import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import styles from "./style.module.scss";
import { Link } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Surveille l'état de connexion
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe(); // Nettoie l'écouteur
  }, []);

  if (!user) {
    return (
      <div className={styles.protectedRouteContainer}>
        <i className="fa-regular fa-circle-xmark"></i>
        <p>Vous devez être connecté pour accéder à cette page.</p>
        <Link to="/">Se connecter</Link>
      </div>
    );
  }

  return children; // Affiche la page protégée si l'utilisateur est connecté
}
