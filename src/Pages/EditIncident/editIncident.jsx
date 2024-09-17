import { useState, useEffect } from 'react';
import styles from "./style.module.scss";
import IncidentForm from '../../Components/incidentForm/incidentForm';
import { db } from "../../firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";

export default function EditIncident() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [incident, setIncident] = useState(null);
    const { incidentId } = useParams(); // Récupération de l'ID depuis les paramètres de l'URL

    const fetchIncident = async () => {
        setLoading(true);
        try {
            const docRef = doc(db, "incidentReports", incidentId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                setIncident(docSnap.data());
            } else {
                console.log("Aucun incident trouvé !");
                setIncident(null);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération de l'incident : ", error);
            setError(error);
        }
        setLoading(false);
    };

    useEffect(() => {
        console.log("incidentId from useParams:", incidentId); // Vérifiez ici
        if (incidentId) {
            fetchIncident();
        } else {
            console.error("Incident ID is missing");
        }
    }, [incidentId]);

    const handleSubmit = async (incidentData) => {
        setLoading(true);
        try {
            const docRef = doc(db, "incidentReports", incidentId);
            await updateDoc(docRef, incidentData);

            // Redirection ou message de succès ici
          
            window.location.href = "/incidents"; // Redirection vers la liste des incidents
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'incident : ", error);
            setError(error);
        }
        setLoading(false);
    };

    return (
        <div className={styles.editIncidentContainer}>
            <h1>Modifier un incident</h1>

            {loading && <p>Chargement...</p>}
            {error && <p>Une erreur est survenue : {error.message}</p>}

            {incident && (
                <IncidentForm initialData={incident} onSubmit={handleSubmit} />
            )}
        </div>
    );
}
