import styles from "./style.module.scss";
import IncidentForm from "../../Components/incidentForm/incidentForm";

export default function CreateIncident() {
  const handleFormSubmit = (data) => {
    console.log("Form submitted with data:", data);
    // Traitement des donnée
  };

  return (
    <div className={styles.createIncidentContainer}>
      <h2>Créer une nouvelle fiche incident</h2>
      <IncidentForm onSubmit={handleFormSubmit} />
    </div>
  );
}
