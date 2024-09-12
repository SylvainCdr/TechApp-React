import { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { db } from "../../firebase/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

export default function Missions() {
  const [missions, setMissions] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Fonction pour récupérer les fiches missions depuis Firestore
  const fetchMissions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "missions"));
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
        urlPhoto: doc.data().urlPhoto, // Assurez-vous que le champ photoURL existe
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

  // Fonction pour obtenir l'URL de la photo du technicien
  const getTechnicianPhotoURL = (name) => {
    const technician = technicians.find((tech) => tech.name === name);
    return technician ? technician.urlPhoto : null;
  };

  // Fonction pour supprimer une mission
const deleteMission = async (missionId) => {
  // Confirmation avant suppression
  const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: "Cette action est irréversible !",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer !',
      cancelButtonText: 'Annuler'
  });

  if (result.isConfirmed) {
      try {
          await deleteDoc(doc(db, "missions", missionId));
          // Après suppression, mettre à jour la liste des missions
          fetchMissions();
          Swal.fire(
              'Supprimé !',
              'La mission a été supprimée.',
              'success'
          );
      } catch (error) {
          console.error("Erreur lors de la suppression de la mission :", error);
          Swal.fire(
              'Erreur',
              'Une erreur est survenue lors de la suppression de la mission.',
              'error'
          );
      }
  }
};

  return (
    <div className={styles.missionsContainer}>
      <h1>Fiches Missions</h1>
      <Link to="/missions/create" className={styles.createMission}>
        <i className="fa-solid fa-plus"></i> Créer une nouvelle fiche mission
      </Link>

      <div className={styles.missionsList}>
        {missions.map((mission) => (
          <div className={styles.missionItem}>
            <h2>
              {mission.createdAt.toDate().toLocaleDateString()} -{" "}
              {mission.client.nomEntreprise}
            </h2>
            <p>
              Date(s) d'intervention :{mission.interventionStartDate} -{" "}
              {mission.interventionEndDate}
            </p>

            <div className={styles.section1}>
              <div className={styles.section1Left}>
                <h3>Entreprise / Site</h3>
                <ul>
                  <li>Client : {mission.client.nomEntreprise}</li>
                  <li>Email : {mission.client.email}</li>
                  <li>Téléphone : {mission.client.tel}</li>
                  <li>Site : {mission.site.adresse}</li>
                  <li>Nom contact : {mission.site.nomContact}</li>
                  <li>Fonction : {mission.site.fonctionContact}</li>
                  <li>Téléphone : {mission.site.telContact}</li>
                </ul>
              </div>
              <div className={styles.section1Right}>
                <h3>Intervenant </h3>
                <p>{mission.intervenant}</p>
                {getTechnicianPhotoURL(mission.intervenant) && (
                  <img
                    src={getTechnicianPhotoURL(mission.intervenant)}
                    alt={`Photo de ${mission.intervenant}`}
                  />
                )}
              </div>
            </div>
            <div className={styles.section2}>
              <div className={styles.section2Left}>
                <h3>Mission(s) :</h3>
                <ul>
                  {mission.missions.map((mission, index) => (
                    <li key={index}>
                      <i class="fa-solid fa-chevron-right"></i>
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
                      <i class="fa-solid fa-minus"></i>
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
                Voir la fiche mission
              </Link>

              <Link
                to={`/missions/edit/${mission.id}`}
                className={styles.editMission}
              >
                Modifier
              </Link>

              {/* Bouton Supprimer */}
              <Link
                className={styles.deleteMission}
                onClick={() => deleteMission(mission.id)}
              >
                Supprimer
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
