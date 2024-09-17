import { useState, useEffect } from "react";
import styles from "./style.module.scss";
import { addDoc, getDocs, collection } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import Swal from "sweetalert2";

export default function IncidentForm({ initialData, onSubmit }) {
  const [client, setClient] = useState({
    email: "",
    nomEntreprise: "",
    tel: "",
  });
  const [site, setSite] = useState({
    adresse: "",
    fonctionContact: "",
    nomContact: "",
    telContact: "",
  });
  const [technicians, setTechnicians] = useState([]);
  const [selectedIntervenant, setSelectedIntervenant] = useState([]); // Intervenant sélectionné
  const [customIntervenant, setCustomIntervenant] = useState([]); // Intervenant personnalisé
  const [intervenantType, setIntervenantType] = useState(""); // "sélection" ou "autre"
  const [photos, setPhotos] = useState([]);
  const [remarques, setRemarques] = useState([{ remarque: "", photos: [] }]);
  const [risques, setRisques] = useState(false);
  const [actions, setActions] = useState([""]);
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());
  const [missionsDangereuses, setMissionsDangereuses] = useState([""]);
  const [interventionReportId, setInterventionReportId] = useState("");

  useEffect(() => {
    if (initialData) {
      setClient(initialData.client || {});
      setSite(initialData.site || {});
      setTechnicians(initialData.intervenants || []);
      setPhotos(initialData.photos || []);
      setRemarques(initialData.remarques || [{ remarque: "", photos: [] }]);
      setRisques(initialData.risques || false);
      setActions(initialData.actions || [""]);
      setCreatedAt(initialData.createdAt || new Date().toISOString());
      setMissionsDangereuses(initialData.missionsDangereuses || [""]);
      setInterventionReportId(initialData.interventionReportId || "");
    }
  }, [initialData]);

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTechnicians(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const incidentData = {
      client,
      site,
      photos,
      remarques,
      risques,
      actions,
      createdAt,
      missionsDangereuses,
      interventionReportId,
      intervenants: intervenantType === "autre" ? [customIntervenant] : selectedIntervenant,
    };
    console.log('Données de la fiche incident:', incidentData);
    onSubmit(incidentData);
    const incidentRef = collection(db, "incidentReports");
    addDoc(incidentRef, incidentData);
  
    Swal.fire({
      title: "Fiche incident créée ou mise à jour !",
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
    });
    setTimeout(() => {
      window.location.href = "/incidents";
    }, 1500);
  };
  
  

  const handleIntervenantChange = (e) => {
    const value = e.target.value;
    if (value === "autre") {
      setIntervenantType("autre");
    } else {
      setIntervenantType("selection");
      setSelectedIntervenant(value);
    }
  };

  const handleCustomIntervenantChange = (e) => {
    setCustomIntervenant(e.target.value);
  };

  const addRemarqueField = () => {
    setRemarques([...remarques, { remarque: "", photos: [] }]);
  };

  const removeRemarqueField = (index) => {
    setRemarques(remarques.filter((_, i) => i !== index));
  };

  const handleRemarqueChange = (index, value) => {
    const newRemarques = [...remarques];
    newRemarques[index].remarque = value;
    setRemarques(newRemarques);
  };

  const addActionField = () => {
    setActions([...actions, ""]);
  };

  const removeActionField = (index) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleActionChange = (index, value) => {
    const newActions = [...actions];
    newActions[index] = value;
    setActions(newActions);
  };

  const addMissionDangereuseField = () => {
    setMissionsDangereuses([...missionsDangereuses, ""]);
  };

  const removeMissionDangereuseField = (index) => {
    setMissionsDangereuses(missionsDangereuses.filter((_, i) => i !== index));
  };

  const handleMissionDangereuseChange = (index, value) => {
    const newMissionsDangereuses = [...missionsDangereuses];
    newMissionsDangereuses[index] = value;
    setMissionsDangereuses(newMissionsDangereuses);
  };

  return (
    <div className={styles.incidentFormContainer}>
      <form onSubmit={handleSubmit}>
        <h3>Client</h3>
        <div className={styles.formGroup}>
          <label>Email :</label>
          <input
            type="email"
            value={client.email}
            onChange={(e) => setClient({ ...client, email: e.target.value })}
            required
          />
        </div>
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
          <label>Téléphone :</label>
          <input
            type="tel"
            value={client.tel}
            onChange={(e) => setClient({ ...client, tel: e.target.value })}
            required
          />
        </div>

        <h3>Site</h3>
        <div className={styles.formGroup}>
          <label>Adresse :</label>
          <input
            type="text"
            value={site.adresse}
            onChange={(e) => setSite({ ...site, adresse: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Nom du contact :</label>
          <input
            type="text"
            value={site.nomContact}
            onChange={(e) => setSite({ ...site, nomContact: e.target.value })}
            required
          />
        </div>
        <div className={styles.formGroup}>
          <label>Fonction du contact :</label>
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
          <label>Choisir un intervenant :</label>
          <select onChange={handleIntervenantChange} value={intervenantType}>
            <option value="">Sélectionner un intervenant</option>
            {technicians.map((technician, index) => (
              <option key={index} value={technician.id}>{technician.nom}</option>
            ))}
            <option value="autre">Autre intervenant...</option>
          </select>
        </div>

        {intervenantType === "autre" && (
          <div className={styles.formGroup}>
            <label>Nom de l'autre intervenant :</label>
            <input
              type="text"
              value={customIntervenant}
              onChange={handleCustomIntervenantChange}
            />
          </div>
        )}

        <h3>Risques</h3>
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={risques}
              onChange={() => setRisques(!risques)}
            />
            Risque identifié
          </label>
        </div>

        <h3>Remarque(s) de l'intervenant :</h3>
        {remarques.map((remarque, index) => (
          <div key={index} className={styles.remarqueField}>
            <input
              type="text"
              value={remarque.remarque}
              onChange={(e) => handleRemarqueChange(index, e.target.value)}
              placeholder="Ajouter une remarque"
            />
            <button
              type="button"
              onClick={() => removeRemarqueField(index)}
            >
              Supprimer remarque
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addRemarqueField}
        >
          Ajouter remarque
        </button>

        <h3>Actions :</h3>
        {actions.map((action, index) => (
          <div key={index} className={styles.actionField}>
            <input
              type="text"
              value={action}
              onChange={(e) => handleActionChange(index, e.target.value)}
              placeholder="Ajouter une action"
            />
            <button
              type="button"
              onClick={() => removeActionField(index)}
            >
              Supprimer action
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addActionField}
        >
          Ajouter action
        </button>

        <h3>Missions Dangereuses :</h3>
        {missionsDangereuses.map((mission, index) => (
          <div key={index} className={styles.missionField}>
            <input
              type="text"
              value={mission}
              onChange={(e) => handleMissionDangereuseChange(index, e.target.value)}
              placeholder="Ajouter une mission dangereuse"
            />
            <button
              type="button"
              onClick={() => removeMissionDangereuseField(index)}
            >
              Supprimer mission dangereuse
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addMissionDangereuseField}
        >
          Ajouter mission dangereuse
        </button>

        <h3>Photos :</h3>
        <div>
          {photos.map((photo, index) => (
            <img key={index} src={photo} alt={`photo-${index}`} className={styles.photo} />
          ))}
        </div>

        <button type="submit">Soumettre</button>
      </form>
    </div>
  );
}
