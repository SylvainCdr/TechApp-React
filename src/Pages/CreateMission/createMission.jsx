import styles from "./style.module.scss";
import MissionForm from "../../Components/missionForm/missionForm";

export default function CreateMission() {
  return (
    <div className={styles.createMissionContainer}>
      <h2>Créer une nouvelle fiche mission</h2>
      <MissionForm />
    </div>
  );
}
