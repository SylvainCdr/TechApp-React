import { db } from "../firebase/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";

export const createOrUpdateIncidentReport = async (incidentData) => {
  try {
    const { client, site, intervenants = [], missionsDangereuses = [], actions = [], remarques, risques, interventionReportId } = incidentData;

    // Validation des données
    if (!client || !site || !Array.isArray(intervenants) || !Array.isArray(missionsDangereuses) || !Array.isArray(actions) || !Array.isArray(remarques)) {
      throw new Error("Données invalides pour la création du rapport d'incident.");
    }

    // Simplifier la requête pour vérifier uniquement certains champs clés (ex : nom du client et adresse du site)
    const incidentQuery = query(
      collection(db, "incidentReports"),
      where("client.nomEntreprise", "==", client.nomEntreprise),
      where("site.adresse", "==", site.adresse),
      where("interventionReportId", "==", interventionReportId)
    );

    const querySnapshot = await getDocs(incidentQuery);

    if (querySnapshot.empty) {
      // Ajouter le rapport d'incident si aucun document similaire n'existe
      await addDoc(collection(db, "incidentReports"), {
        client: {
          nomEntreprise: client.nomEntreprise,
          email: client.email,
          tel: client.tel,
        },
        site: {
          adresse: site.adresse,
          nomContact: site.nomContact,
          fonctionContact: site.fonctionContact,
          telContact: site.telContact,
        },
        intervenants,
        missionsDangereuses,
        actions,
        remarques,
        risques,
        createdAt: new Date(),
        interventionReportId,
      });
      console.log("Fiche d'incident créée avec succès.");
    } else {
      console.log("Fiche d'incident déjà existante.");
    }
  } catch (error) {
    console.error("Erreur lors de la création ou de la mise à jour du rapport d'incident : ", error);
  }
};
