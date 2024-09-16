import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation(); // Récupère l'URL actuelle

  useEffect(() => {
    window.scrollTo(0, 0); // Scrolle tout en haut de la page
  }, [pathname]); // Chaque fois que l'URL change

  return null; // Ce composant n'a pas besoin de renvoyer un JSX
}

export default ScrollToTop;
