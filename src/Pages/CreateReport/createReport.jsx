import styles from "./style.module.scss";
import ReportForm from "../../Components/reportForm/reportForm";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";

export default function CreateReport() {
  const handleSubmit = async (reportData) => {
    try {
      // Créer un document dans Firestore avec les données du rapport
      const reportRef = await addDoc(collection(db, "interventionReports"), reportData);
      console.log("Rapport soumis avec l'ID :", reportRef.id);
      alert("Rapport soumis avec succès !");
      window.location.href = "/reports"; // Rediriger l'utilisateur vers la liste des rap
    } catch (error) {
      console.error("Erreur lors de la soumission du rapport :", error);
      alert("Une erreur est survenue lors de la soumission du rapport.");
    }
  };

  return (
    <div className={styles.createReportContainer}>
      <h2>Créer un rapport d'intervention</h2>
      <ReportForm onSubmit={handleSubmit} />
    </div>
  );
}
