import styles from "./style.module.scss";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { collection, getDocs } from "firebase/firestore";
import Swal from "sweetalert2";
import { auth } from "../../firebase/firebase";

export default function Mission() {
  const { missionId } = useParams();
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [createdBy, setCreatedBy] = useState(null);

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

  // Fonction pour récupérer l'URL de la photo de l'intervenant
  const getTechnicianPhotoURL = (technicianId) => {
    const technician = technicians.find((tech) => tech.id === technicianId);
    return technician ? technician.urlPhoto : "/assets/default-avatar.jpg"; // Avatar par défaut si pas de photo
  };

  
  // Fonction pour copier les informations du site dans le presse-papiers
  const handleCopy = () => {
    const siteInfo = `${mission.site.adresse}`;
    navigator.clipboard.writeText(siteInfo).then(() => {
      Swal.fire({
        title: "Adresse copiée !",
        text: "L'adresse du site a été copiée dans le presse-papiers",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    });
  };
  
  // fonction pour récupérer l email du createdBy depuis le uid de Authentification
  const fetchCreatedBy = async () => {
    try {
      const user = auth.currentUser;
      setCreatedBy(user.email);
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur : ", error);
    }
  };
  
  useEffect(() => {
    fetchMission();
    fetchTechnicians();
    fetchCreatedBy();
  }, [missionId]);
  
  return (
    <div className={styles.missionContainer} id="mission-content">
      <h1>Fiche Mission N° {missionId}</h1>
      {loading && <p>Chargement en cours...</p>}
      {error && <p>{error}</p>}

      {mission && (
        <div className={styles.missionItem}>
          <h2>
            {mission.createdAt?.toDate().toLocaleDateString()} -{" "}
            {mission.client.nomEntreprise}
          </h2>
          <p>
            Date(s) d'intervention : {""}
            {new Date(mission.interventionStartDate).toLocaleDateString(
              "fr-FR"
            ) ===
            new Date(mission.interventionEndDate).toLocaleDateString("fr-FR")
              ? new Date(mission.interventionStartDate).toLocaleDateString(
                  "fr-FR" 
                )  
              : `${new Date(mission.interventionStartDate).toLocaleDateString(
                  "fr-FR"
                )} - ${new Date(mission.interventionEndDate).toLocaleDateString(
                  "fr-FR"
                )}`}{" "}
</p>
<br />
    
            
            
          <p>Missions créé(e) par : {createdBy}</p>
          <br />
          <p>Commercial référent : {mission.commercial}</p>
          <br />
           
          <p> Devis N° : {mission.devis}</p>
          <div className={styles.section1}>
            <ul className={styles.section1Left}>
              <h3>Entreprise / Site</h3>
              <p>
                <i className="fa-regular fa-building"></i> Client :{" "}
                {mission.client.nomEntreprise}
              </p>
              <p>
                <i className="fa-solid fa-phone"></i>Téléphone :{" "}
                {mission.client.tel}
              </p>
              <p>
                <i className="fa-solid fa-at"></i>Email : {mission.client.email}
              </p>
              <p>
                <i className="fa-solid fa-location-dot"></i>Adresse du site :{" "}
                {mission.site.adresse}
              </p>
              <p>
                <i className="fa-regular fa-user"></i>Contact sur site :{" "}
                {mission.site.nomContact}
              </p>
              <p>
                <i className="fa-regular fa-address-card"></i>Fonction du
                contact : {mission.site.fonctionContact}
              </p>
              <p>
                <i className="fa-solid fa-mobile-screen-button"></i> Téléphone :{" "}
                {mission.site.telContact}
              </p>

              <button onClick={handleCopy} className={styles.copyButton}>
                Copier l'adresse du site
              </button>
            </ul>
            <div className={styles.section1Right}>
              <h3>Intervenant(s)</h3>
              <div className={styles.technicians}>
              {mission.intervenants && mission.intervenants.length > 0 ? (
                    mission.intervenants.map((intervenantId, index) => (
                      <div key={index} className={styles.technicianItem}>
                        <p>
                          {technicians.find((tech) => tech.id === intervenantId)
                            ?.name || "Nom inconnu"}
                        </p>
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
              <h3>Risques / EPI</h3>
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
        <div className={styles.section3Left}>
          <h3>Commentaire(s) :</h3>
          <p><i class="fa-solid fa-circle-info"></i> {mission.comments || "Aucun commentaire"}</p>
        </div>

        <div className={styles.section3Right}>
          <h3>Plan de prévention :</h3>
          {mission.planPrevention ? (
            <a
              href={mission.planPrevention}
              target="_blank"
              rel="noreferrer"
              className={styles.planPreventionLink}
            >
              <i className="fa-solid fa-file-pdf"></i> Voir le plan de prévention
            </a>
          ) : (
            <p>Aucun plan de prévention</p>
          )}
        </div>
      </div>
        </div>
      )}

      <div className={styles.bottom}>
        <h2>Rappel des règles de sécurité</h2>

        <h3>Conduite à tenir en cas d’accident :</h3>

        <div className={styles.securityRules}>
          <div className={styles.icons}>
            <img src="/assets/pharmacy.png" alt="" />
            <img src="/assets/panic.png" alt="" />
            <img src="/assets/help.png" alt="" />
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

        <img
          src="/assets/numerosUrgence.jpg"
          className={styles.numUrgence}
          alt=""
        />
      </div>
    </div>
  );
}
