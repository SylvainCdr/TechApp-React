// components/Logout.js
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import styles from "./style.module.scss";

export default function Logout() {
  const handleLogout = async () => {
    try {
      await signOut(auth);

     
    } catch (error) {
      console.error("Erreur lors de la déconnexion : ", error);
    }
  };

  return <p onClick={handleLogout} className={styles.logout}> <i className="fa-solid fa-toggle-on" > </i> </p>;
}
