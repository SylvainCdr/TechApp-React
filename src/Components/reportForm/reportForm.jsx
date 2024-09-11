import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase";
import styles from "./style.module.scss";
import { createOrUpdateIncidentReport } from "../../automation/incidentAutomation";

export default function ReportForm({ initialData, onSubmit }) {
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
  const [intervenantsList, setIntervenantsList] = useState([]);
  const [actionsDone, setActionsDone] = useState([{ description: "" }]);
  const [remarques, setRemarques] = useState([{ remarque: "" }]);
  const [photos, setPhotos] = useState([]);
  const [risques, setRisques] = useState(false);
  const [missionsDangereuses, setMissionsDangereuses] = useState([""]);
  const [actions, setActions] = useState([""]);

  useEffect(() => {
    // Remplir les champs avec les données initiales si elles existent
    if (initialData) {
      setClient(initialData.client || {});
      setSite(initialData.site || {});
      setIntervenant(initialData.intervenant || "");
      setActionsDone(initialData.actionsDone || [{ description: "" }]);
            setRemarques(initialData.remarques || [{ remarque: "" }]);
      setPhotos(initialData.photos || []);
      setRisques(initialData.risques || false);
    }
  }, [initialData]);

  // Fonction pour récupérer les techniciens depuis Firestore
  const fetchTechnicians = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().firstName + " " + doc.data().lastName,
        urlPhoto: doc.data().urlPhoto,
      }));
      setIntervenantsList(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des techniciens : ", error);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const uploadedPhotoUrls = [];
  
      // Gérer les nouvelles photos uniquement
      for (const file of photos) {
        if (file instanceof File) {
          const storageRef = ref(storage, `interventionPhotos/${file.name}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);
          uploadedPhotoUrls.push(downloadURL);
        } else {
          uploadedPhotoUrls.push(file); // Garde les URLs existantes
        }
      }
  
      // Données du rapport à envoyer
      const reportData = {
        client,
        site,
        intervenant,
        actionsDone,
        remarques,
        photos: uploadedPhotoUrls,
        risques,
        createdAt: initialData?.createdAt || new Date(),
      };
  
      // Appel de la fonction onSubmit (mise à jour ou création du rapport)
      await onSubmit(reportData);
  
      // Si un risque est identifié, créer une fiche d'incident
      if (risques) {
        const incidentData = {
          client,
          site,
          intervenant,
          missionsDangereuses, 
          actions: actionsDone.map(a => a.description), // Utiliser actionsDone pour les actions
          remarques: remarques.map(r => r.remarque), // Utiliser remarques pour les remarques
          photos: uploadedPhotoUrls,
          risques: "OUI", // Indiquer que des risques ont été identifiés
          interventionReportId: initialData?.id || "", // Passer l'ID du rapport d'intervention
        };
        await createOrUpdateIncidentReport(incidentData);
      }
  
      // Réinitialiser le formulaire ou rediriger l'utilisateur après la soumission
      setClient({ nomEntreprise: "", email: "", tel: "" });
      setSite({ adresse: "", nomContact: "", fonctionContact: "", telContact: "" });
      setIntervenant("");
      setActionsDone([{ description: "" }]);
      setRemarques([{ remarque: "" }]);
      setPhotos([]);
      setRisques(false);
      
      // Redirection ou confirmation
      alert("Rapport soumis avec succès.");
      window.location.href = "/reports";
      
    } catch (error) {
      console.error("Erreur lors de la soumission du rapport : ", error);
      alert("Une erreur est survenue lors de la soumission du rapport.");
    }
  };
  


  const handleRemovePhoto = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
  };

  const addActionField = () => {
    setActionsDone([...actionsDone, { description: "" }]);
  };

  const removeActionField = (index) => {
    setActionsDone(actionsDone.filter((_, i) => i !== index));
  };

  const handleActionChange = (index, value) => {
    const newActionsDone = [...actionsDone];
    newActionsDone[index].description = value;
    setActionsDone(newActionsDone);
  };

  const addRemarqueField = () => {
    setRemarques([...remarques, { remarque: "" }]);
  };

  const removeRemarqueField = (index) => {
    setRemarques(remarques.filter((_, i) => i !== index));
  };

  const handleRemarqueChange = (index, value) => {
    const newRemarques = [...remarques];
    newRemarques[index].remarque = value;
    setRemarques(newRemarques);
  };

  return (
    <div className={styles.reportFormContainer}>
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
          <label>Choisir l'intervenant :</label>
          <select
            value={intervenant}
            onChange={(e) => setIntervenant(e.target.value)}
            required
          >
            <option value="">Sélectionner un intervenant</option>
            {intervenantsList.map((tech) => (
              <option key={tech.id} value={tech.name}>
                {tech.name}
              </option>
            ))}
          </select>
        </div>

        <h3>Actions menées</h3>
        {actionsDone.map((action, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Description des actions menées :</label>
            <input
              type="text"
              value={action.description} // Afficher la description actuelle
              onChange={(e) => handleActionChange(index, e.target.value)} // Permettre l'édition
              required
            />
            {actionsDone.length > 1 && (
              <button
                type="button"
                onClick={() => removeActionField(index)} // Supprimer l'action si nécessaire
                className={styles.removeActionButton}
              >
                Supprimer
              </button>
            )}
        </div>
        ))}
        <button
          type="button"
          onClick={addActionField}
          className={styles.addActionButton}
          >
          Ajouter une action
        </button>

        <h3>Remarques</h3>
        {remarques.map((remarque, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Remarques :</label>
            <input
              type="text"
              value={remarque.remarque} // Afficher la remarque actuelle
              onChange={(e) => handleRemarqueChange(index, e.target.value)} // Permettre l'édition
            />
            {remarques.length > 1 && (
              <button
                type="button"
                onClick={() => removeRemarqueField(index)} // Supprimer la remarque si nécessaire
                className={styles.removeRemarqueButton}
              >
                Supprimer
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addRemarqueField}
          className={styles.addRemarqueButton}
        >
          Ajouter une remarque
        </button>

        <h3>Photos</h3>
        <div className={styles.formGroup}>
          <label>Ajouter des photos :</label>
          <input type="file" multiple onChange={handlePhotoChange} />
          <div className={styles.photoPreview}>
            {photos.map((photo, index) => (
              <div key={index} className={styles.photoItem}>
                <span>{photo.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(index)}
                  className={styles.removePhotoButton}
                >
                  Supprimer
                </button>
              </div>
            ))}
          </div>
        </div>

        <h3>Risques / EPI</h3>
        <div className={styles.formGroup}>
          <label>
            <input
              type="checkbox"
              checked={risques}
              onChange={() => setRisques(!risques)}
            />
            Intervention comportant des risques
          </label>
        </div>

        <button className={styles.submitButton} type="submit">Créer le rapport</button>
      </form>
    </div>
  );
}
