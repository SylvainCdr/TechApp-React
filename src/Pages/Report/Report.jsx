import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "./style.module.scss";

export default function InterventionReport() {
  
  const { reportId } = useParams(); // Récupérer l'ID du rapport depuis l'URL
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer un rapport d'intervention spécifique depuis Firestore
  const fetchReport = async () => {
    try {
      const docRef = doc(db, "interventionReports", reportId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Rapport introuvable");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du rapport : ", error);
      setError("Erreur lors de la récupération du rapport");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reportId]);

  if (loading) {
    return <p>Chargement en cours...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className={styles.reportContainer}>

      <h1> Rapport d'intervention N° {report.id} </h1>
      {report ? (
        <div className={styles.reportItem}>
          <h2> {report.createdAt?.toDate().toLocaleDateString()} - {report.client.nomEntreprise}</h2>
       
          <h3>Site : {report.site.adresse}</h3>
          <h3>Intervenant : {report.intervenant}</h3>
          <p>Actions menées :   {report.actionsDone.map((action, index) => (
          <li key={index}>{action.description}</li>
        ))}</p>
          <p>Remarques : {report.remarques.map((remarque, index) => (
          <li key={index}>{remarque.remarque}</li>
        ))}</p>
          <p>Risques : {report.risques ? "Oui" : "Non"}</p>
          <div>
            <h4>Photos :</h4>
            <div className={styles.photosContainer}>
              {report.photos?.map((photoUrl, index) => (
                <img key={index} src={photoUrl} alt={`Photo ${index + 1}`} className={styles.photo} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p>Rapport non disponible.</p>
      )}
    </div>
  );
}
