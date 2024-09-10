import styles from "./style.module.scss";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";

export default function Mission() {
  const { missionId } = useParams();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);

  const fetchMission = async () => {
    try {
      const docRef = doc(db, "missions", missionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMission({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Mission introuvable");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la mission : ", error);
      setError("Erreur lors de la récupération de la mission");
    } finally {
      setLoading(false);
    }
  };
  // on va chercher la photo de l'intervenant urlPhoto

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
        urlPhoto: doc.data().urlPhoto,
      }));
      setTechnicians(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchMission();
    fetchTechnicians();
  }, [missionId]);

  return (
    <div className={styles.missionContainer}>
      <h1>Fiche Mission N° {missionId}</h1>
      {loading && <p>Chargement en cours...</p>}
      {error && <p>{error}</p>}

      {mission && (
        <div className={styles.missionItem}>
          <h2>
            {mission.createdAt?.toDate().toLocaleDateString()} -{" "}
            {mission.client.nomEntreprise}
          </h2>
          <div className={styles.section1}>
            <div className={styles.section1Left}>
              <h3>Entreprise / Site</h3>
              <p>Email : {mission.client.email}</p>
              <p>Téléphone : {mission.client.tel}</p>
              <p>Site : {mission.site.adresse}</p>
              <p>Nom contact : {mission.site.nomContact}</p>
              <p>Fonction : {mission.site.fonctionContact}</p>
              <p>Téléphone : {mission.site.telContact}</p>
            </div>
            <div className={styles.section1Right}>
              <h3>Intervenant</h3>
              <p>{mission.intervenant}</p>
              <img
                src={
                  technicians.find(
                    (technician) => technician.name === mission.intervenant
                  )?.urlPhoto
                }
                alt={`Photo de ${mission.intervenant}`}
                className={styles.technicianPhoto}
              />
            </div>
          </div>
          <div className={styles.section2}>
            <div className={styles.section2Left}>
              <h3>Mission(s) :</h3>
              <ul>
                {mission.missions.map((mission, index) => (
                  <li key={index}>{mission}</li>
                ))}
              </ul>
            </div>
            <div className={styles.section2Right}>
              <h3>Risques / EPI</h3>
              <ul>
                {mission.risqueEPI.map((risque, index) => (
                  <li key={index}>{risque}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className={styles.bottom}>
        <h2>Rappel des règles de sécurité</h2>

        <h3>Conduite à tenir en cas d’accident :</h3>

        <div className={styles.securityRules}>
          <div className={styles.icons}>
            {" "}
            <img src="/assets/pharmacy.png" alt="" />{" "}
            <img src="/assets/panic.png" alt="" />{" "}
            <img src="/assets/help.png" alt="" />{" "}
            
            <img src="/assets/call.png" alt="" />
          </div>
          <div className={styles.text}>
           
            <p>
              En cas de blessure bénigne faites appel à la personne désignée
              pour dispenser les premiers soins, s’il en existe une, et prévenez
              votre responsable.
            </p>
        
            <p>Ne paniquez pas ! Pensez à supprimer le risque s’il persiste</p>
            <p>
              Contacter le sauveteur secouriste du travail présent dans votre
              équipe. Ne bougez pas le blessé et protégez le des risques
              éventuels
            </p>
            <p>
              Alertez ou faites alerter les secours. Composez : le 15 pour le
              SAMU, le 18 pour les pompiers, le 112 pour le numéro d’urgence
              européen
            </p>
          
          </div>
        </div>

        <h3>Numéros d’urgences :</h3>

        <img src="/assets/numerosUrgence.jpg" className={styles.numUrgence} alt="" />

      </div>
    </div>
  );
}
