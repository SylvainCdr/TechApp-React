import { db } from "../firebase/firebase";
import { collection, addDoc, query, where, getDocs, doc, updateDoc } from "firebase/firestore";

export  const createOrUpdateIncidentReport = async (incidentData) => {
  try {
    const { client, site, intervenant, missionsDangereuses = [], actions = [], remarques, photos, risques } = incidentData;

    // Validation des données
    if (!client || !site || !intervenant || !Array.isArray(missionsDangereuses) || !Array.isArray(actions) || !Array.isArray(remarques)) {
      throw new Error("Données invalides pour la création du rapport d'incident.");
    }

    // Vérifier si un rapport d'incident similaire existe déjà
    const incidentQuery = query(
      collection(db, "incidentReports"),
      where("client", "==", client),
      where("site", "==", site),
      where("intervenant", "==", intervenant),
      where("createdAt", "==", incidentData.createdAt)
    );
    const querySnapshot = await getDocs(incidentQuery);

    if (querySnapshot.empty) {
      // Ajouter le rapport d'incident si aucun document similaire n'existe
      await addDoc(collection(db, "incidentReports"), {
        client,
        site,
        intervenant,
        missionsDangereuses,
        actions,
        remarques,
        photos,
        risques,
        createdAt: new Date(),
      });
    } else {
      console.log("Fiche d'incident déjà existante.");
    }

    console.log("Fiche d'incident créée ou mise à jour avec succès.");
  } catch (error) {
    console.error("Erreur lors de la création ou de la mise à jour du rapport d'incident : ", error);
  }
};



