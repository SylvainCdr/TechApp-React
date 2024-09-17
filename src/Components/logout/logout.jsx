// components/Logout.js
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/firebase";
import Swal from "sweetalert2";
import styles from "./style.module.scss";

export default function Logout() {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Swal.fire({
        icon: "success",
        title: "Vous êtes déconnecté",
        showConfirmButton: false,
        timer: 1500,
      }).then(() => {
        window.location.replace("/");
        }
        );
      // Redirige l'utilisateur après la déconnexion
    } catch (error) {
      console.error("Erreur lors de la déconnexion : ", error);
    }
  };

  return <button onClick={handleLogout} className={styles.logout}> <i class="fa-solid fa-user-slash"></i> </button>;
}
