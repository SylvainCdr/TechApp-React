import styles from './style.module.scss';
import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { db } from '../../firebase/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import MissionForm from '../../Components/missionForm/missionForm';

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
            const missionRef = doc(db, "missions", missionId);
            await updateDoc(missionRef, updatedMission);
            alert("Mission mise à jour avec succès !");
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la mission : ", error);
            alert("Erreur lors de la mise à jour de la mission.");
        }
    };

    if (loading) return <p>Chargement en cours...</p>;
    if (error) return <p>{error}</p>;

    return (
        <div className={styles.editMissionContainer}>
            <h1>Modifier une fiche mission</h1>
            {mission && (
                <MissionForm mission={mission} onSubmit={handleSubmit} />
            )}
        </div>
    );
}
