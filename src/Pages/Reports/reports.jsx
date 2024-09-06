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
      const querySnapshot = await getDocs(collection(db, "interventionReports"));
      const reportsList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReports(reportsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des rapports : ", error);
    }
  };

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
        urlPhoto: doc.data().urlPhoto // Assurez-vous que le champ photoURL existe
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
    const technician = technicians.find(tech => tech.name === name);
    return technician ? technician.urlPhoto : null;
  };

  return (
    <div className={styles.reportsContainer}>
      <h1>Rapports d'intervention</h1>
      <Link to="/reports/create" className={styles.createReport}>
        <i className="fa-solid fa-plus"></i> Créer un nouveau rapport d'intervention
      </Link>

      <ul className={styles.reportsList}>
        {reports.map(report => (
          <li key={report.id} className={styles.reportItem}>
            <h2>Date : {report.createdAt.toDate().toLocaleDateString()}</h2>
            <h2>Client : {report.client.nomEntreprise}</h2>
            <p>Site : {report.site.adresse}</p>
            <p>Intervenant : {report.intervenant}</p>
            {getTechnicianPhotoURL(report.intervenant) && (
              <img
                src={getTechnicianPhotoURL(report.intervenant)}
                alt={`Photo de ${report.intervenant}`}
                className={styles.technicianPhoto}
              />
            )}
            <p>Actions menées : {report.actionsMenees}</p>
            <p>Remarques : {report.remarques}</p>
            <p>Risques/EPI : {report.risqueEPI}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
