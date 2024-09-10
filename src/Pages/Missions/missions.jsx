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

      <div className={styles.missionsList}>
        {missions.map((mission) => (
          <div className={styles.missionItem}>
            <h2>
              {mission.createdAt.toDate().toLocaleDateString()} -{" "}
              {mission.client.nomEntreprise}
            </h2>
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
                    <li key={index}><i class="fa-solid fa-chevron-right"></i>{mission}</li>
                  ))}
                </ul>
              </div>
              <div className={styles.section2Right}>
                <h3> Risques / EPI :</h3>
                <ul>
                  {mission.risqueEPI.map((risque, index) => (
                    <li key={index}><i class="fa-solid fa-minus"></i>{risque}</li>
                  ))}
                </ul>
              </div>
            </div>



            <div className={styles.section3}>
              <Link to={`/mission/${mission.id}`} className={styles.viewMission}>
                Voir la fiche mission
              </Link>

              <Link
                to={`/missions/edit/${mission.id}`}
                className={styles.editMission}
              >
                Modifier 
              </Link>
</div>

          </div>
        ))}
      </div>
    </div>
  );
}
