import styles from "./style.module.scss";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import MissionForm from "../../Components/missionForm/missionForm";
import Swal from "sweetalert2";

export default function EditMission() {
  const { missionId } = useParams(); // Récupérer l'ID de la mission depuis l'URL
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fonction pour récupérer la mission existante depuis Firestore
  const fetchMission = async () => {
    try {
      const docRef = doc(db, "missions", missionId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setMission({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError("Mission introuvable");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la mission : ", error);
      setError("Erreur lors de la récupération de la mission");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMission();
  }, [missionId]);

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (updatedMission) => {
    try {
      // Mise à jour de la mission
      const missionRef = doc(db, "missions", missionId);
      await updateDoc(missionRef, updatedMission);

      // Récupérer le rapport d'intervention associé à la mission
      const q = query(
        collection(db, "interventionReports"),
        where("missionId", "==", missionId)
      );
      const querySnapshot = await getDocs(q);
      const reportDocs = querySnapshot.docs;

      if (!reportDocs.length) {
        throw new Error("Aucun rapport d'intervention associé trouvé");
      }

      // Mise à jour du rapport d'intervention
      const reportRef = doc(db, "interventionReports", reportDocs[0].id); // On prend le premier rapport trouvé
      await updateDoc(reportRef, {
        client: updatedMission.client,
        site: updatedMission.site,
        intervenant: updatedMission.intervenant,
        interventionStartDate: updatedMission.interventionStartDate,
        interventionEndDate: updatedMission.interventionEndDate,
        updatedAt: new Date(),
      });

      // Affichage d'une alerte pour informer l'utilisateur
      Swal.fire({
        title: "Mission mise à jour",
        text: "La mission et le rapport d'intervention ont bien été mis à jour",
        icon: "success",
        confirmButtonText: "Ok",
      }).then(() => {
        window.location.href = "/missions"; // Redirection vers la liste des missions
      });
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour de la mission ou du rapport d'intervention : ",
        error
      );
      Swal.fire({
        title: "Erreur",
        text: "Une erreur est survenue lors de la mise à jour de la mission ou du rapport d'intervention",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  if (loading) return <p>Chargement en cours...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className={styles.editMissionContainer}>
      <h1>Modifier une fiche mission</h1>
      {mission && <MissionForm mission={mission} onSubmit={handleSubmit} />}
    </div>
  );
}
