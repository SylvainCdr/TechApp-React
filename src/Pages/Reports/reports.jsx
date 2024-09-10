import { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Fonction pour récupérer les rapports d'intervention depuis Firestore
  const fetchReports = async () => {
    try {
      const querySnapshot = await getDocs(
        collection(db, "interventionReports")
      );
      const reportsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des rapports : ", error);
    }
  };

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
    fetchReports();
    fetchTechnicians();
  }, []);

  // Fonction pour obtenir l'URL de la photo du technicien
  const getTechnicianPhotoURL = (name) => {
    const technician = technicians.find((tech) => tech.name === name);
    return technician ? technician.urlPhoto : null;
  };

  return (
    <div className={styles.reportsContainer}>
      <h1>Rapports d'intervention</h1>

      <Link to="/reports/create" className={styles.createReport}>
        <i className="fa-solid fa-plus"></i> Créer un nouveau rapport
        d'intervention
      </Link>

      <ul className={styles.reportsList}>
        {reports.map((report) => (
          <li key={report.id} className={styles.reportItem}>
            <h2>
              {" "}
              {report.createdAt?.toDate().toLocaleDateString()} -{" "}
              {report.client.nomEntreprise}
            </h2>
            <div className={styles.section1}>
              <div className={styles.section1Left}>
                <h4>Entreprise / Site</h4>
                <ul>
                <li>Email : {report.client.email}</li>
                <li>Téléphone : {report.client.tel}</li>
                <li>Adresse du site : {report.site.adresse}</li>
                <li>Nom du contact sur site : {report.site.nomContact}</li>
                <li>Fonction du contact : {report.site.fonctionContact}</li>
                <li>Téléphone du contact: {report.site.telContact}</li>
                </ul>
              </div>

              <div className={styles.section1Right}>
              <h4>Intervenant</h4>
                <h3> {report.intervenant}</h3>
                {getTechnicianPhotoURL(report.intervenant) && (
                  <img
                    src={getTechnicianPhotoURL(report.intervenant)}
                    alt={`Photo de ${report.intervenant}`}
                    className={styles.technicianPhoto}
                  />
                )}
              </div>
            </div>

            <div className={styles.section2}>
              <div className={styles.section2Left}>
                {/* Affichage des actions menées */}
                <h4>Actions menées :</h4>
                <ul>
                  {report.actionsMenées.map((action, index) => (
                    <li key={index}><i class="fa-regular fa-circle-check"></i>{action.description}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section2Right}>
                {/* Affichage des remarques */}
                <h4>Remarques :</h4>
                <ul>
                  {report.remarques.map((remarque, index) => (
                    <li key={index}><i class="fa-solid fa-minus"></i>{remarque.remarque}</li>
                  ))}
                </ul>

                <p> <i class="fa-solid fa-triangle-exclamation"></i>Intervention à risque :  {report.risques ? "Oui" : "Non"}</p>

                <p> <i class="fa-solid fa-paperclip"></i>Nombre de photos jointes : {report.photos.length}</p>
              </div>
            </div>

            <div className={styles.section3}>
              <Link
                to={`/reports/view/${report.id}`}
                className={styles.viewButton}
              >
                Voir le rapport 
              </Link>

              <Link
                to={`/reports/edit/${report.id}`}
                className={styles.editButton}
              >
                Remplir / Modifier
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
