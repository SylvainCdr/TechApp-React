import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import styles from "./style.module.scss";
import ReportForm from "../../Components/reportForm/reportForm";
import { createIncidentReport } from "../../automation/incidentAutomation";
import Swal from "sweetalert2";

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

      // Récupérer les anciennes données avant la mise à jour
      const oldReportSnap = await getDoc(reportRef);
      const oldReportData = oldReportSnap.data();

      // Mettre à jour le rapport d'intervention
      await updateDoc(reportRef, updatedReport);

      // Log pour vérifier les anciennes et nouvelles valeurs de "risques"
      console.log("Ancien rapport:", oldReportData);
      console.log("Nouveau rapport:", updatedReport);

      // Comparer l'ancien et le nouveau statut de la case "risques"
      if (!oldReportData.risques && updatedReport.risques) {
        console.log(
          "La case 'risques' est maintenant cochée. Création ou mise à jour de la fiche d'incident..."
        );
        // Créer ou mettre à jour la fiche d'incident si la case "risques" a été cochée
        await createIncidentReport({
          ...updatedReport,
          interventionReportId: reportId, // Passer l'ID du rapport d'intervention
        });
      }

      Swal.fire({
        icon: "success",
        title: "Rapport mis à jour ! Pensez à le clôturer pour avertir Anaelle.",
        showConfirmButton: true,
        confirmButtonText: "OK",
      }).then(() => {
        //rediriger l'utilisateur vers le rapport modifié
        window.location.href = "/report/" + reportId;
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour du rapport :", error);
      alert("Une erreur est survenue lors de la mise à jour du rapport.");
    }
  };

  return (
    <div className={styles.editReportContainer}>
      <h1>Remplir / Modifier un rapport d'intervention</h1>
      {reportData && (
        <ReportForm
          initialData={reportData} // Pré-remplir le formulaire avec les données du rapport
          onSubmit={handleUpdate} // Utiliser handleUpdate pour soumettre les modifications
        />
      )}
    </div>
  );
}
