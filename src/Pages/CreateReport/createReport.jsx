import styles from "./style.module.scss";
import ReportForm from "../../Components/reportForm/reportForm";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { createOrUpdateIncidentReport } from "../../automation/incidentAutomation";
import Swal from "sweetalert2";

export default function CreateReport() {
  const handleSubmit = async (reportData) => {
    try {
      // Créer un document dans Firestore avec les données du rapport
      const reportRef = await addDoc(collection(db, "interventionReports"), reportData);
      console.log("Rapport soumis avec l'ID :", reportRef.id);
    
      // Vérifier si la case "risques" est cochée
      if (reportData.risques) {
        console.log("La case 'risques' est cochée. Création de la fiche d'incident...");
        // Créer la fiche d'incident si la case "risques" est cochée
        await createOrUpdateIncidentReport({
          ...reportData,
          interventionReportId: reportRef.id, // Passer l'ID du rapport créé
        });
      }
    
      Swal.fire({
        title: "Rapport soumis avec succès !",
        text: "Vous allez être redirigé vers la liste des rapports.",
        icon: "success",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      }).then(() => {
        setTimeout(() => {
          window.location.href = "/reports"; // Rediriger l'utilisateur vers la liste des rapports après l'alerte
        }, 500); // 500 ms pour permettre à l'alerte de se fermer proprement
      });
    } catch (error) {
      console.error("Erreur lors de la soumission du rapport :", error);
      Swal.fire({
        title: "Erreur",
        text: "Une erreur est survenue lors de la soumission du rapport.",
        icon: "error",
        confirmButtonText: "OK",
        allowOutsideClick: false,
      });
    }
  };
  
  

  return (
    <div className={styles.createReportContainer}>
      <h2>Créer un rapport d'intervention</h2>
      <ReportForm onSubmit={handleSubmit} />
    </div>
  );
}
