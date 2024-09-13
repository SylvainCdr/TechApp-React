import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import {
  doc,
  getDocs,
  getDoc,
  updateDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import styles from "./style.module.scss";
import { useParams } from "react-router-dom";
import Swal from "sweetalert2";

export default function MissionForm() {
  const { missionId } = useParams(); // Récupération de l'ID de la mission
  const [client, setClient] = useState({
    nomEntreprise: "",
    email: "",
    tel: "",
  });
  const [site, setSite] = useState({
    adresse: "",
    nomContact: "",
    fonctionContact: "",
    telContact: "",
  });
  const [intervenants, setIntervenants] = useState([]); // Tableau pour stocker plusieurs intervenants
  const [missions, setMissions] = useState([""]);
  const [risqueEPI, setRisqueEPI] = useState([""]);
  const [intervenantsExistants, setIntervenantsExistants] = useState([]);
  const [dateStartIntervention, setDateStartIntervention] = useState(
    new Date().toISOString().substring(0, 10)
  ); // Format YYYY-MM-DD
  const [dateEndIntervention, setDateEndIntervention] = useState(
    new Date().toISOString().substring(0, 10)
  ); // Format YYYY-MM-DD

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchIntervenants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map(
        (doc) => doc.data().firstName + " " + doc.data().lastName
      );
      setIntervenantsExistants(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  // Fonction pour récupérer les données de la mission existante
  const fetchMission = async () => {
    if (!missionId) return;
    try {
      const missionRef = doc(db, "missions", missionId);
      const missionSnap = await getDoc(missionRef);

      if (missionSnap.exists()) {
        const missionData = missionSnap.data();
        setClient(missionData.client);
        setSite(missionData.site);
        setIntervenants(missionData.intervenants || []); // Plusieurs intervenants
        setMissions(missionData.missions || [""]);
        setRisqueEPI(missionData.risqueEPI || [""]);
        setDateStartIntervention(
          missionData.interventionStartDate?.substring(0, 10) ||
            new Date().toISOString().substring(0, 10)
        );
        setDateEndIntervention(
          missionData.interventionEndDate?.substring(0, 10) ||
            new Date().toISOString().substring(0, 10)
        );
      } else {
        console.log("Mission non trouvée");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la mission : ", error);
    }
  };

  useEffect(() => {
    fetchIntervenants();
    fetchMission();
  }, [missionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Créer la fiche mission
      const missionData = {
        client,
        site,
        intervenants, // Utilisation du tableau d'intervenants
        missions,
        risqueEPI,
        interventionStartDate: dateStartIntervention,
        interventionEndDate: dateEndIntervention,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      Swal.fire({
        title: "Mission enregistrée",
        text: "Un rapport d'intervention a été créé automatiquement",
        icon: "success",
        confirmButtonText: "Ok",
      }).then(() => {
        window.location.href = "/missions";
      });

      if (missionId) {
        // Mettre à jour la mission existante
        const missionRef = doc(db, "missions", missionId);
        await updateDoc(missionRef, missionData);
      } else {
        // Créer une nouvelle mission
        const missionRef = await addDoc(collection(db, "missions"), missionData);
        const missionId = missionRef.id; // Récupération de l'ID de la mission

        // Automatiser la création du rapport d'intervention associé
        const interventionReportData = {
          missionId,
          client,
          site,
          intervenants, // Tableau d'intervenants
          actionsDone: [],
          remarques: [],
          photos: [],
          risques: false,
          createdAt: new Date(),
          interventionStartDate: dateStartIntervention,
          interventionEndDate: dateEndIntervention,
        };

        await addDoc(
          collection(db, "interventionReports"),
          interventionReportData
        );
      }
    } catch (error) {
      console.error("Erreur lors de la création ou mise à jour de la mission ou du rapport d'intervention : ", error);
      Swal.fire({
        title: "Erreur",
        text: "Une erreur est survenue lors de la création ou mise à jour de la mission",
        icon: "error",
        confirmButtonText: "Ok",
      });
    }
  };

  // Ajouter un nouveau champ pour les missions
  const addMissionField = () => {
    setMissions([...missions, ""]);
  };

  // Supprimer un champ pour les missions
  const removeMissionField = (index) => {
    setMissions(missions.filter((_, i) => i !== index));
  };

  // Ajouter un nouveau champ pour les risques/EPI
  const addRisqueField = () => {
    setRisqueEPI([...risqueEPI, ""]);
  };

  // Supprimer un champ pour les risques/EPI
  const removeRisqueField = (index) => {
    setRisqueEPI(risqueEPI.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.missionFormContainer}>
      <form onSubmit={handleSubmit}>
        <h3>Client</h3>
        <div className={styles.formGroup}>
          <label>Nom de l'entreprise :</label>
          <input
            type="text"
            value={client.nomEntreprise}
            onChange={(e) =>
              setClient({ ...client, nomEntreprise: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Adresse mail :</label>
          <input
            type="email"
            value={client.email}
            onChange={(e) => setClient({ ...client, email: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Téléphone :</label>
          <input
            type="tel"
            value={client.tel}
            onChange={(e) => setClient({ ...client, tel: e.target.value })}
            required
          />
        </div>

        <h3>Site d'intervention</h3>
        <div className={styles.formGroup}>
          <label>Adresse du site :</label>
          <input
            type="text"
            value={site.adresse}
            onChange={(e) => setSite({ ...site, adresse: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Nom du contact sur site :</label>
          <input
            type="text"
            value={site.nomContact}
            onChange={(e) => setSite({ ...site, nomContact: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Fonction du contact sur site :</label>
          <input
            type="text"
            value={site.fonctionContact}
            onChange={(e) =>
              setSite({ ...site, fonctionContact: e.target.value })
            }
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Téléphone du contact :</label>
          <input
            type="tel"
            value={site.telContact}
            onChange={(e) => setSite({ ...site, telContact: e.target.value })}
            required
          />
        </div>

        <h3>Date(s) d'intervention</h3>
        <div className={styles.formGroup}>
          <label>Date de début :</label>
          <input
            type="date"
            value={dateStartIntervention}
            onChange={(e) => setDateStartIntervention(e.target.value)}
            required
          />
          <label>Date de fin :</label>
          <input
            type="date"
            value={dateEndIntervention}
            onChange={(e) => setDateEndIntervention(e.target.value)}
            required
          />
        </div>

        <h3>Intervenant(s)</h3>
        <div className={styles.formGroup}>
          <label>Sélectionnez un ou plusieurs intervenants :</label>
          {intervenantsExistants.map((intervenant, index) => (
            <div key={index}>
              <input
                type="checkbox"
                value={intervenant}
                checked={intervenants.includes(intervenant)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setIntervenants([...intervenants, e.target.value]);
                  } else {
                    setIntervenants(
                      intervenants.filter((intervenant) => intervenant !== e.target.value)
                    );
                  }
                }}
              />
              <label>{intervenant}</label>
            </div>
          ))}
          
        </div>

        <h3>Missions</h3>
        {missions.map((mission, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Mission {index + 1} :</label>
            <input
              type="text"
              value={mission}
              onChange={(e) => {
                const updatedMissions = [...missions];
                updatedMissions[index] = e.target.value;
                setMissions(updatedMissions);
              }}
              required
            />
            <button
              type="button"
              onClick={() => removeMissionField(index)}
              disabled={missions.length <= 1}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" onClick={addMissionField}>
          Ajouter une mission
        </button>

        <h3>Risques / EPI</h3>
        {risqueEPI.map((risque, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Risque / EPI {index + 1} :</label>
            <input
              type="text"
              value={risque}
              onChange={(e) => {
                const updatedRisqueEPI = [...risqueEPI];
                updatedRisqueEPI[index] = e.target.value;
                setRisqueEPI(updatedRisqueEPI);
              }}
              required
            />
            <button
              type="button"
              onClick={() => removeRisqueField(index)}
              disabled={risqueEPI.length <= 1}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" onClick={addRisqueField}>
          Ajouter un risque/EPI
        </button>

        <button type="submit">Enregistrer la mission</button>
      </form>
    </div>
  );
}
