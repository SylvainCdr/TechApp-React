import { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { db } from "../../firebase/firebase";
import { collection, getDocs, deleteDoc, doc, orderBy, query } from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { motion } from "framer-motion";

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const missionsPerPage = 6; // Nombre de missions par page

  // Fonction pour récupérer les fiches missions depuis Firestore
  const fetchMissions = async () => {
    try {
      const q = query(collection(db, "missions"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const missionsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMissions(missionsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des missions : ", error);
    }
  };

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
        urlPhoto: doc.data().urlPhoto, // Assurez-vous que le champ urlPhoto existe
      }));
      setTechnicians(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchMissions();
    fetchTechnicians();
  }, []);

  // Fonction pour obtenir l'URL de la photo du technicien par ID
  const getTechnicianPhotoURL = (id) => {
    const technician = technicians.find((tech) => tech.id === id);
    return technician ? technician.urlPhoto : null;
  };

  // Fonction pour supprimer une mission
  const deleteMission = async (missionId) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "missions", missionId));
        fetchMissions();
        Swal.fire("Supprimé !", "La mission a été supprimée.", "success");
      } catch (error) {
        console.error("Erreur lors de la suppression de la mission :", error);
        Swal.fire(
          "Erreur",
          "Une erreur est survenue lors de la suppression de la mission.",
          "error"
        );
      }
    }
  };

  const totalPages = Math.ceil(missions.length / missionsPerPage);

  // Extraire les missions pour la page actuelle
  const currentMissions = missions.slice(
    (currentPage - 1) * missionsPerPage,
    currentPage * missionsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.missionsContainer}>
      <h1>Fiches Missions</h1>
      <Link to="/missions/create" className={styles.createMission}>
        <i className="fa-solid fa-plus"></i> Créer une nouvelle fiche mission
      </Link>

      <div className={styles.missionsList}>
        {currentMissions.map((mission) => (
          <motion.div
            className={styles.missionItem}
            key={mission.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2>
              {mission.createdAt.toDate().toLocaleDateString()} -{" "}
              {mission.client.nomEntreprise}
            </h2>
            <p>
            <i class="fa-solid fa-calendar-days"></i>Date(s) d'intervention : 
  {new Date(mission.interventionStartDate).toLocaleDateString('fr-FR') === new Date(mission.interventionEndDate).toLocaleDateString('fr-FR') 
    ? new Date(mission.interventionStartDate).toLocaleDateString('fr-FR') // Si les dates sont identiques
    : `${new Date(mission.interventionStartDate).toLocaleDateString('fr-FR')} - ${new Date(mission.interventionEndDate).toLocaleDateString('fr-FR')}`} {/* Sinon afficher les deux */}
</p>



            <div className={styles.section1}>
              <div className={styles.section1Left}>
                <h3>Entreprise / Site</h3>
                <ul>
                  <li>
                    <i className="fa-regular fa-building"></i> Client :{" "}
                    {mission.client.nomEntreprise}
                  </li>
                  <li>
                    <i className="fa-solid fa-phone"></i> Téléphone :{" "}
                    {mission.client.tel}
                  </li>
                  <li>
                    <i className="fa-solid fa-at"></i> Email :{" "}
                    {mission.client.email}
                  </li>
                  <li>
                    <i className="fa-solid fa-location-dot"></i> Adresse du site :{" "}
                    {mission.site.adresse}
                  </li>
                  <li>
                    <i className="fa-regular fa-user"></i> Contact sur site :{" "}
                    {mission.site.nomContact}
                  </li>
                  <li>
                    <i className="fa-regular fa-address-card"></i> Fonction du contact :{" "}
                    {mission.site.fonctionContact}
                  </li>
                  <li>
                    <i className="fa-solid fa-mobile-screen-button"></i> Téléphone :{" "}
                    {mission.site.telContact}
                  </li>
                </ul>
              </div>
              <div className={styles.section1Right}>
                <h3>Intervenant(s)</h3>
                <div className={styles.technicians}>
                  {mission.intervenants && mission.intervenants.length > 0 ? (
                    mission.intervenants.map((intervenantId, index) => (
                      <div key={index} className={styles.technicianItem}>
                        <p>{technicians.find(tech => tech.id === intervenantId)?.name || "Nom inconnu"}</p>
                        <img
                          src={getTechnicianPhotoURL(intervenantId)}
                          alt={`Photo de technicien`}
                        />
                      </div>
                    ))
                  ) : (
                    <p>Aucun intervenant</p>
                  )}
                </div>
              </div>
            </div>
            <div className={styles.section2}>
              <div className={styles.section2Left}>
                <h3>Mission(s) :</h3>
                <ul>
                  {mission.missions.map((mission, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-chevron-right"></i>
                      {mission}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.section2Right}>
                <h3> Risques / EPI :</h3>
                <ul>
                  {mission.risqueEPI.map((risque, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-minus"></i>
                      {risque}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className={styles.section3}>
              <Link
                to={`/mission/${mission.id}`}
                className={styles.viewMission}
              >
                <i className="fa-solid fa-eye"></i>
              </Link>

              <Link
                to={`/missions/edit/${mission.id}`}
                className={styles.editMission}
              >
                <i className="fa-solid fa-pen-to-square"></i>
              </Link>

              {/* Bouton Supprimer */}
              <Link
                className={styles.deleteMission}
                onClick={() => deleteMission(mission.id)}
              >
                <i className="fa-solid fa-trash"></i>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Précédent
        </button>
        <span>
          Page {currentPage} sur {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Suivant
        </button>
      </div>
    </div>
  );
}
