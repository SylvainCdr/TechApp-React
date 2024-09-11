import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";

// Fonction pour automatiser la création du rapport d'intervention
export const createInterventionReport = async (missionData) => {
  try {
    // Récupération des informations à partir de la fiche de mission
    const { client, site, intervenant, missions, risqueEPI } = missionData;

    // Création du rapport d'intervention dans une nouvelle collection "interventionReports"
    const reportData = {
      client,
      site,
      intervenant,
      actionsDone: [],
      remarques: [],
      photos: [], 
      risques: risqueEPI.length > 0, // Détermine s'il y a des risques selon la présence de données
      createdAt: new Date(),
    };

    await addDoc(collection(db, "interventionReports"), reportData);
    console.log("Rapport d'intervention créé automatiquement");
  } catch (error) {
    console.error("Erreur lors de la création du rapport d'intervention : ", error);
  }
};
