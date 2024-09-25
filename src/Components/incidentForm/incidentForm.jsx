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
  const [intervenantType, setIntervenantType] = useState(""); // "sélection" ou "autre"
  const [photos, setPhotos] = useState([]);
  const [remarques, setRemarques] = useState([{ remarque: "", photos: [] }]);
  const [risques, setRisques] = useState(false);
  const [actions, setActions] = useState([""]);
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());
  const [missionsDangereuses, setMissionsDangereuses] = useState([""]);
  const [interventionReportId, setInterventionReportId] = useState("");
  const [isOtherIntervenantChecked, setIsOtherIntervenantChecked] =
    useState(false);
  const [selectedIntervenants, setSelectedIntervenants] = useState([]);
  const [customIntervenant, setCustomIntervenant] = useState("");

  useEffect(() => {
    if (initialData) {
      setClient(initialData.client || {});
      setSite(initialData.site || {});
      setPhotos(initialData.photos || []);
      setRemarques(initialData.remarques || [{ remarque: "", photos: [] }]);
      setRisques(initialData.risques || false);
      setActions(initialData.actions || [""]);
      setCreatedAt(initialData.createdAt || new Date().toISOString());
      setMissionsDangereuses(initialData.missionsDangereuses || []);
      setInterventionReportId(initialData.interventionReportId || "");

      // Initialisation des intervenants sélectionnés
      if (initialData.intervenants) {
        setSelectedIntervenants(initialData.intervenants); // S'assurer que ce soit un tableau d'ID
      }
    }
  }, [initialData]);

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
      }));
      setTechnicians(techniciansList);
    } catch (error) {
      console.error("Error getting documents: ", error);
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
      intervenants:
        intervenantType === "autre"
          ? [customIntervenant]
          : selectedIntervenants,
    };

    console.log("Données de la fiche incident:", incidentData);

    // Appelez la fonction onSubmit pour mettre à jour l'incident
    onSubmit(incidentData);

    // Ne pas créer un nouveau document si on est en mode de modification
    if (!initialData) {
      const incidentRef = collection(db, "incidentReports");
      addDoc(incidentRef, incidentData);

      Swal.fire({
        title: "Fiche incident créée !",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        title: "Fiche incident mise à jour !",
        icon: "success",
        showConfirmButton: false,
        timer: 1500,
      });
    }

    setTimeout(() => {
      window.location.href = "/incidents";
    }, 1500);
  };

  const handleIntervenantChange = (e) => {
    const selectedId = e.target.value;
    if (selectedIntervenants.includes(selectedId)) {
      setSelectedIntervenants(
        selectedIntervenants.filter((id) => id !== selectedId)
      );
    } else {
      setSelectedIntervenants([...selectedIntervenants, selectedId]);
    }
  };

  console.log("Intervenants sélectionnés:", selectedIntervenants);

  const handleOtherIntervenantChange = (e) => {
    setCustomIntervenant(e.target.value);
  };

  const handleOtherIntervenantCheckbox = (e) => {
    setIsOtherIntervenantChecked(e.target.checked);
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

        <h3>Intervenant(s)</h3>
        {technicians.map((technician) => (
          <div key={technician.id} className={styles.formGroup}>
            <label>
              <input
                type="checkbox"
                value={technician.id}
                onChange={handleIntervenantChange}
                checked={selectedIntervenants.includes(technician.id)}
              />
              {technician.name}
            </label>
          </div>
        ))}
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              onChange={handleOtherIntervenantCheckbox}
              checked={isOtherIntervenantChecked}
            />
            Autre intervenant...
          </label>
        </div>

        {isOtherIntervenantChecked && (
          <div className={styles.formGroup}>
            <label>Nom de l'autre intervenant :</label>
            <input
              type="text"
              value={customIntervenant}
              onChange={handleOtherIntervenantChange}
              required
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
            Intervention comportant un risque
          </label>
        </div>

        <h3>Remarque(s) du salarié :</h3>
        {remarques.map((remarque, index) => (
          <div key={index} className={styles.formGroup}>
            <input
              type="text"
              value={remarque.remarque}
              onChange={(e) => handleRemarqueChange(index, e.target.value)}
              placeholder="Ajouter une remarque"
            />
            <button type="button" onClick={() => removeRemarqueField(index)}
              className={styles.removeBtn}>
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" onClick={addRemarqueField}
        className={styles.addBtn} >
          <i class="fa-solid fa-plus"></i> Ajouter remarque
        </button>

        <h3>Action(s) :</h3>
        {actions.map((action, index) => (
          <div key={index} className={styles.formGroup}>
            <input
              type="text"
              value={action}
              onChange={(e) => handleActionChange(index, e.target.value)}
              placeholder="Ajouter une action"
            />
            <button type="button" onClick={() => removeActionField(index)}
              className={styles.removeBtn}>
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" onClick={addActionField}
        className={styles.addBtn}>
          <i class="fa-solid fa-plus"></i> Ajouter action
        </button>

        <h3>Nature du danger :</h3>
        {missionsDangereuses.map((mission, index) => (
          <div key={index} className={styles.formGroup}>
            <input
              type="text"
              value={mission}
              onChange={(e) =>
                handleMissionDangereuseChange(index, e.target.value)
              }
              placeholder=" ex : danger électrique"
            />
            <button
              type="button"
              onClick={() => removeMissionDangereuseField(index)}
              className={styles.removeBtn}
            >
              Supprimer
            </button>
          </div>
        ))}
        <button type="button" onClick={addMissionDangereuseField}
        className={styles.addBtn}>
          <i class="fa-solid fa-plus"></i> Ajouter mission dangereuse
        </button>

        <h3>Photo(s) liée(s) au rappport d'intervention</h3>
<div>
  {remarques.map((remarque, index) => (
    remarque.photos && remarque.photos.length > 0 && (
      <div key={index} className={styles.photoItem}>
       
        {remarque.photos.map((photo, photoIndex) => (
          <img
            key={photoIndex}
            src={photo}
            alt={`remarque-photo-${index}-${photoIndex}`}
            
          />
        ))}
      </div>
    )
  ))}
</div>


        <button type="submit" className={styles.submitBtn}>Soumettre</button>
      </form>
    </div>
  );
}
