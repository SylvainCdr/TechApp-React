import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import styles from "./style.module.scss";
import ReportForm from "../../Components/reportForm/reportForm";

export default function EditReport() {
  const { reportId } = useParams();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  

  // Fonction pour récupérer les données du rapport depuis Firestore
  const fetchReportData = async () => {
    try {
      const reportRef = doc(db, "interventionReports", reportId);
      const reportSnap = await getDoc(reportRef);
      if (reportSnap.exists()) {
        setReportData(reportSnap.data());
      } else {
        console.error("Rapport non trouvé !");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du rapport :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [reportId]);

  // Fonction pour gérer la soumission du formulaire de modification
  const handleUpdate = async (updatedReport) => {
    try {
      const reportRef = doc(db, "interventionReports", reportId);
      await updateDoc(reportRef, updatedReport);
      alert("Rapport mis à jour avec succès !");

      // Rediriger l'utilisateur vers la page de détails du rapport
      window.location.href = `/reports/view/${reportId}`;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rapport :", error);
      alert("Une erreur est survenue lors de la mise à jour du rapport.");
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div className={styles.editReportContainer}>
      <h2>Remplir / Modifier un rapport d'intervention</h2>
      {reportData && (
        <ReportForm
          initialData={reportData} // Pré-remplir le formulaire avec les données du rapport
          onSubmit={handleUpdate} // Utiliser handleUpdate pour soumettre les modifications
        />
      )}
    </div>
  );
}
