import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { sendEmail } from "../utils/emailService"; // Importation du service d'email

// Fonction pour obtenir les informations du technicien par ID
const getTechnicianInfoById = async (technicianId) => {
  console.log(`Recherche des infos pour l'ID : ${technicianId}`);
  try {
    const technicianRef = doc(db, "technicians", technicianId);
    const docSnapshot = await getDoc(technicianRef);

    if (!docSnapshot.exists()) {
      console.log(`Aucun technicien trouvé avec l'ID ${technicianId}`);
      return null;
    } else {
      const data = docSnapshot.data();
      console.log("Technicien trouvé :", data);

      // Combiner le prénom et le nom de famille
      const fullName = `${data.firstName || ""} ${data.lastName || ""}`.trim();

      return {
        email: data.email || null,
        fullName: fullName || "Technicien",
      };
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des infos :", error);
    return null;
  }
};

// Fonction pour créer un rapport d'intervention à la soumission d'une mission
export const createInterventionReport = async (missionId, missionData) => {
  try {
    const interventionReportData = {
      missionId,
      client: missionData.client,
      site: missionData.site,
      intervenants: missionData.intervenants,
      actionsDone: [],
      remarques: [],
      photos: [],
      risques: false,
      createdAt: new Date(),
      interventionStartDate: missionData.interventionStartDate,
      interventionEndDate: missionData.interventionEndDate,
      signataireNom: "",
      signatureUrl: "",
      isSigned: false,
    };

    // Ajout du rapport d'intervention à Firestore
    const reportRef = await addDoc(
      collection(db, "interventionReports"),
      interventionReportData
    );
    console.log("Rapport d'intervention créé avec succès :", reportRef.id);

    // Récupérer les emails et noms des intervenants par leur ID
    const intervenantsInfos = await Promise.all(
      missionData.intervenants.map(async (intervenantId) => {
        console.log("ID de l'intervenant :", intervenantId);
        const info = await getTechnicianInfoById(intervenantId);
        if (info) {
          console.log(`Infos récupérées pour l'ID ${intervenantId} :`, info);
          return info; // Récupérer le nom et l'email
        } else {
          console.warn(`Aucune info trouvée pour l'ID ${intervenantId}`);
          return null;
        }
      })
    );

    // Filtrer les infos null ou undefined
    const validInfos = intervenantsInfos.filter((info) => info !== null);
    

    // Envoi des emails
    validInfos.forEach(async (info) => {
      try {
        await sendEmail({
          to: info.email,
          to_name: info.fullName, // Utiliser le nom complet du technicien
          missionId: missionId,
          reportId: reportRef.id,
          startDate: missionData.interventionStartDate,
          endDate: missionData.interventionEndDate,
          clientName: missionData.client.nomEntreprise,
          siteName: missionData.site.siteName,
        });
        console.log(`Email envoyé avec succès à ${info.email}`);
      } catch (error) {
        console.error(
          `Erreur lors de l'envoi de l'email à ${info.email} :`,
          error
        );
      }
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création du rapport d'intervention :",
      error
    );
    throw error;
  }
};
