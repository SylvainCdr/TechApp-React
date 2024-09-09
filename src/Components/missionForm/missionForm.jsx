import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import styles from "./style.module.scss";
import { createInterventionReport } from "../../automation/reportAutomation";

export default function MissionForm() {
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
  const [intervenant, setIntervenant] = useState("");
  const [nouvelIntervenant, setNouvelIntervenant] = useState("");
  const [missions, setMissions] = useState([""]); // Initialisé avec un champ vide
  const [risqueEPI, setRisqueEPI] = useState([""]); // Initialisé avec un champ vide
  const [intervenantsExistants, setIntervenantsExistants] = useState([]);

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

  useEffect(() => {
    fetchIntervenants();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const missionData = {
        client,
        site,
        intervenant: nouvelIntervenant || intervenant,
        missions,
        risqueEPI,
        createdAt: new Date(),
      };

      console.log("Tentative d'ajout d'une mission dans Firestore...");
      const docRef = await addDoc(collection(db, "missions"), missionData);
      console.log("Mission ajoutée avec succès avec l'ID : ", docRef.id);
      alert("Mission ajoutée avec succès !");

      // Automatisation de la création du rapport d'intervention
      await createInterventionReport(missionData); // Envoi des données de mission

      // Reset du formulaire après la soumission
      setClient({ nomEntreprise: "", email: "", tel: "" });
      setSite({
        adresse: "",
        nomContact: "",
        fonctionContact: "",
        telContact: "",
      });
      setIntervenant("");
      setNouvelIntervenant("");
      setMissions([""]); // Réinitialiser le tableau de missions
      setRisqueEPI([""]); // Réinitialiser le tableau de risques/EPI
    } catch (error) {
      console.error("Erreur lors de l'ajout de la mission : ", error);
      alert("Une erreur est survenue lors de l'ajout de la mission.");
    }

    // Redirection vers la page des missions (optionnel)
    window.location.href = "/missions";
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

        <h3>Intervenant</h3>
        <div className={styles.formGroup}>
          <label>Sélectionnez un intervenant :</label>
          <select
            value={intervenant}
            onChange={(e) => setIntervenant(e.target.value)}
            required
          >
            <option value="">-- Sélectionnez --</option>
            {intervenantsExistants.map((interv, index) => (
              <option key={index} value={interv}>
                {interv}
              </option>
            ))}
          </select>
        </div>

        <h3>Mission</h3>
        {missions.map((mission, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Description de la mission {index + 1} :</label>
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
            {missions.length > 1 && (
              <button className={styles.removeMission} type="button" onClick={() => removeMissionField(index)}>
                Supprimer ce champ
              </button>
            )}
          </div>
        ))}
        <button className={styles.addMission} type="button" onClick={addMissionField}>
          Ajouter un champ pour la mission
        </button>

        <h3>Risques / EPI</h3>
        {risqueEPI.map((risque, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Risques et Équipements de Protection Individuelle {index + 1} :</label>
            <input
              type="text"
              value={risque}
              onChange={(e) => {
                const updatedRisques = [...risqueEPI];
                updatedRisques[index] = e.target.value;
                setRisqueEPI(updatedRisques);
              }}
              required
            />
            {risqueEPI.length > 1 && (
              <button className={styles.removeRisk} type="button" onClick={() => removeRisqueField(index)}>
                Supprimer ce champ
              </button>
            )}
          </div>
        ))}
        <button className={styles.addRisk} type="button" onClick={addRisqueField}>
          Ajouter un champ pour les risques/EPI
        </button>

        <button className={styles.submitButton} type="submit">Ajouter la mission</button>
      </form>
    </div>
  );
}
