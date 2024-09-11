import { useState } from 'react';
import styles from "./style.module.scss";
import IncidentForm from './IncidentForm'; // Assurez-vous que le chemin est correct
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebaseConfig'; // Assurez-vous que le chemin est correct

export default function CreateIncident() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (incidentData) => {
        setLoading(true);
        setError(null);
        try {
            // Ajout de la fiche d'incident à la collection 'incidentReports'
            await addDoc(collection(db, 'incidentReports'), incidentData);
            // Réinitialiser le formulaire ou rediriger l'utilisateur
            alert('Fiche d\'incident créée avec succès');
        } catch (err) {
            console.error('Erreur lors de la création de la fiche d\'incident:', err);
            setError('Erreur lors de la création de la fiche d\'incident. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.createIncidentContainer}>
            <h2>Créer une fiche d'incident</h2>
            {error && <div className={styles.error}>{error}</div>}
            <IncidentForm onSubmit={handleSubmit} />
            {loading && <div className={styles.loading}>Chargement...</div>}
        </div>
    );
}
