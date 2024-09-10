import { db } from "../firebase/firebase";
import { collection, addDoc } from "firebase/firestore";

export const createIncidentReport = async (incidentData) => {
    try {
        const { client, site, intervenant, missionsDangereuses, actions , remarques, photos, risques } = incidentData;
    
        const reportData = {
        client,
        site,
        intervenant,
        missionsDangereuses, 
        actions, 
        remarques,
        photos,
        risques,
        createdAt: new Date(),
        };
    
        await addDoc(collection(db, "incidentReports"), reportData);
        console.log("Rapport d'incident créé automatiquement");
    } catch (error) {
        console.error("Erreur lors de la création du rapport d'incident : ", error);
    }
    }