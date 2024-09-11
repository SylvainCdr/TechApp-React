import styles from "./style.module.scss";
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function IncidentReports() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [incidents, setIncidents] = useState([]);

  const fetchIncidents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "incidentReports"));
      const incidentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIncidents(incidentsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des rapports : ", error);
    }
  };

  console.log(incidents);

  useEffect(() => {
    fetchIncidents();
  }, []);

  return (
    <div className={styles.incidentsContainer}>
      <h1>Fiches d'incident</h1>

      <Link to="/incidents/create" className={styles.createIncident}>
        <i className="fa-solid fa-plus"></i> Créer un nouveau rapport d'incident
      </Link>

      {loading && <p>Chargement...</p>}
      {error && <p>Une erreur est survenue : {error.message}</p>}

      <ul className={styles.incidentsList}>
        {incidents.map((incident) => (
          <li key={incident.id} className={styles.incidentItem}>
            <h2>
              {" "}
              {incident.createdAt?.toDate().toLocaleDateString()} -{" "}
              {incident.client.nomEntreprise}
            </h2>
            <div className={styles.section1}>
              <div className={styles.section1Left}>
                <h4>Entreprise / Site</h4>
                <ul>
                  <li>Email : {incident.client.email}</li>
                  <li>Téléphone : {incident.client.tel}</li>
                  <li>Adresse du site : {incident.site.adresse}</li>
                  <li>Nom du contact sur site : {incident.site.nomContact}</li>
                  <li>Fonction du contact : {incident.site.fonctionContact}</li>
                  <li>Téléphone du contact : {incident.site.telContact}</li>
                </ul>
              </div>

              <div className={styles.section1Right}>
                <h4>Intervenant</h4>
                <h3> {incident.intervenant}</h3>
               
              </div>
            </div>

            <div className={styles.section2}>
              <div className={styles.section2Left}>
              <h4>Remarques de l'intervenant :</h4>
                <ul>
                  {incident.remarques.map((remarque, index) => (
                    <li key={index}>
                      <i className="fa-solid fa-minus"></i>
                      {remarque.remarque}
                    </li>
                  ))}
                </ul>
                <p>
                  <i className="fa-solid fa-triangle-exclamation"></i>
                  Intervention à risque : {incident.risques ? "Oui" : "Non"}
                </p>
                <p>
                  <i className="fa-solid fa-paperclip"></i>Nombre de photos
                  jointes : {incident.photos.length}
                </p>
              </div>

              <div className={styles.section2Right}>
                <h4>Photos :</h4>
                <ul>
                    {incident.photos.map((photo, index) => (
                        <li key={index}>
                        <img src={photo} alt={`Photo ${index}`} />
                        </li>
                    ))}
                </ul>

                
              </div>
            </div>
            <div className={styles.section3}>
            <div className={styles.section3Left}>
            <h4>Actions menées par l'intervenant :</h4>

                </div>
                <div className={styles.section3Right}>
            <h4>Mission(s) dangereuse(s) :</h4>
                </div>


            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
