import styles from "./style.module.scss";
import IncidentForm from "../../Components/incidentForm/incidentForm";

export default function CreateIncident() {
  return (
    <div className={styles.createIncidentContainer}>
      <h2>Créer une nouvelle fiche incident</h2>
      <IncidentForm />
    </div>
  );
}
