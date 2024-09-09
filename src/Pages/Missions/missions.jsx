import { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

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

  console.log("Technicians: ", technicians);
  console.log("Missions: ", missions);

  return (
    <div className={styles.missionsContainer}>
      <h1>Fiches Missions</h1>
      <Link to="/missions/create" className={styles.createMission}>
        <i className="fa-solid fa-plus"></i> Créer une nouvelle fiche mission
      </Link>

      <ul className={styles.missionsList}>
        {missions.map((mission) => (
          <li key={mission.id} className={styles.missionItem}>
            <h2>Date : {mission.createdAt.toDate().toLocaleDateString()}</h2>
            <h2>Client : {mission.client.nomEntreprise}</h2>
            <p>Site : {mission.site.adresse}</p>
            <p>Intervenant : {mission.intervenant}</p>
            {getTechnicianPhotoURL(mission.intervenant) && (
              <img
                src={getTechnicianPhotoURL(mission.intervenant)}
                alt={`Photo de ${mission.intervenant}`}
                className={styles.technicianPhoto}
              />
            )}

            <p>Mission(s) :</p>
            <ul>
              {mission.missions.map((mission, index) => (
                <li key={index}>{mission}</li>
              ))}
            </ul>

            <p> Risques / EPI :</p>
            <ul>
              {mission.risqueEPI.map((risque, index) => (
                <li key={index}>{risque}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
