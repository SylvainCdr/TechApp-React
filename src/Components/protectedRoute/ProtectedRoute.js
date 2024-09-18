import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import Swal from "sweetalert2";
import { useEffect } from "react";

const ProtectedRoute = ({ children }) => {
  const [user, loading, error] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      
    } else if (!loading && !user) {
      Swal.fire({
        icon: "info",
        title: "Vous êtes déconnecté",
        showConfirmButton: false,
        timer: 1500,
      });
     

    }
  }, [user, loading]);

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (error) {
    return <div>Erreur : {error.message}</div>;
  }



  return user ? children : <Navigate to="/" />;
};

export default ProtectedRoute;
