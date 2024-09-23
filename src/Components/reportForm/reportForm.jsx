import { useState, useEffect } from "react";
import { db } from "../../firebase/firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../firebase/firebase";
import styles from "./style.module.scss";
import { createIncidentReport } from "../../automation/incidentAutomation";
import Signature from "../../utils/signature/signature";
import Resizer from 'react-image-file-resizer';


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
  const [intervenants, setIntervenants] = useState([]);
  const [intervenantsList, setIntervenantsList] = useState([]);
  const [actionsDone, setActionsDone] = useState([
    { description: "", photos: [] },
  ]); // Photos est un tableau
  const [remarques, setRemarques] = useState([{ remarque: "", photos: [] }]); // Photos est un tableau
  const [risques, setRisques] = useState(false);
  // const [missionsDangereuses, setMissionsDangereuses] = useState([""]);
  const [dateStartIntervention, setDateStartIntervention] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [dateEndIntervention, setDateEndIntervention] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [signataireNom, setSignataireNom] = useState(""); // Nom du signataire
  const [signatureUrl, setSignatureUrl] = useState(""); // URL de la signature uploadée
  const [isSigned, setIsSigned] = useState(false); // Indique si le rapport a été signé
  const [isLoading, setIsLoading] = useState(false); // Indique si le formulaire est en cours de soumission
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);


  useEffect(() => {
    if (initialData) {
      setClient(initialData.client || {});
      setSite(initialData.site || {});
      setIntervenants(initialData.intervenants || []);
      setActionsDone(
        initialData.actionsDone || [{ description: "", photos: [] }]
      );
      setRemarques(initialData.remarques || [{ remarque: "", photos: [] }]);
      setRisques(initialData.risques || false);
      // setMissionsDangereuses(initialData.missionsDangereuses || [""]);
      setDateStartIntervention(
        initialData.interventionStartDate?.substring(0, 10) ||
          new Date().toISOString().substring(0, 10)
      );
      setDateEndIntervention(
        initialData.interventionEndDate?.substring(0, 10) ||
          new Date().toISOString().substring(0, 10)
      );
      setSignataireNom(initialData.signataireNom || "");
      setSignatureUrl(initialData.signatureUrl || "");
      setIsSigned(initialData.isSigned || false);
    }
  }, [initialData]);

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


  const handleActionPhotoChange = async (index, e) => {
    const files = Array.from(e.target.files);
    const newActionsDone = [...actionsDone];
  
    const resizedFiles = await Promise.all(files.map(file => 
      new Promise((resolve) => {
        Resizer.imageFileResizer(
          file,
          800, // largeur
          800, // hauteur
          'JPEG', // format
          50, // qualité
          0, // rotation
          uri => {
            resolve(uri); // Renvoie le fichier Blob
          },
          'file' // type de retour
        );
      })
    ));
  
    // Upload des fichiers dans Firebase Storage
    for (const resizedFile of resizedFiles) {
      const storageRef = ref(storage, `interventionPhotos/actions/${resizedFile.name}`);
      await uploadBytes(storageRef, resizedFile);
      const downloadURL = await getDownloadURL(storageRef);
      newActionsDone[index].photos.push(downloadURL);
    }
  
    setActionsDone(newActionsDone);
  };
  
  const handleRemarquePhotoChange = async (index, e) => {
    const files = Array.from(e.target.files);
    const newRemarques = [...remarques];
  
    const resizedFiles = await Promise.all(files.map(file => 
      new Promise((resolve) => {
        Resizer.imageFileResizer(
          file,
          800, // largeur
          800, // hauteur
          'JPEG', // format
          50, // qualité
          0, // rotation
          uri => {
            resolve(uri); // Renvoie le fichier Blob
          },
          'file' // type de retour
        );
      })
    ));
  
    // Upload des fichiers dans Firebase Storage
    for (const resizedFile of resizedFiles) {
      const storageRef = ref(storage, `interventionPhotos/remarques/${resizedFile.name}`);
      await uploadBytes(storageRef, resizedFile);
      const downloadURL = await getDownloadURL(storageRef);
      newRemarques[index].photos.push(downloadURL);
    }
  
    setRemarques(newRemarques);
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true); // Démarrer le chargement
  
    try {
      // Gérer les photos pour chaque action
      for (const [index, action] of actionsDone.entries()) {
        const uploadedActionPhotos = [];
        for (const file of action.photos) {
          if (file instanceof File) {
            const storageRef = ref(
              storage,
              `interventionPhotos/actions/${file.name}`
            );
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            uploadedActionPhotos.push(downloadURL);
          } else {
            uploadedActionPhotos.push(file);
          }
        }
        actionsDone[index].photos = uploadedActionPhotos;
      }
  
      // Gérer les photos pour chaque remarque
      for (const [index, remarque] of remarques.entries()) {
        const uploadedRemarquePhotos = [];
        for (const file of remarque.photos) {
          if (file instanceof File) {
            const storageRef = ref(
              storage,
              `interventionPhotos/remarques/${file.name}`
            );
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);
            uploadedRemarquePhotos.push(downloadURL);
          } else {
            uploadedRemarquePhotos.push(file);
          }
        }
        remarques[index].photos = uploadedRemarquePhotos;
      }
  
      // Données du rapport à envoyer
      const reportData = {
        client,
        site,
        intervenants,
        actionsDone,
        remarques,
        risques,
        createdAt: initialData?.createdAt || new Date(),
        updatedAt: new Date(),
        interventionStartDate: dateStartIntervention,
        interventionEndDate: dateEndIntervention,
        signataireNom,
        signatureUrl,
        isSigned,
      };
  
      // Appel de la fonction onSubmit pour envoyer les données à Firestore
      await onSubmit(reportData);
  
      // Réinitialiser le formulaire ou rediriger si nécessaire
    } catch (error) {
      console.error("Erreur lors de la soumission du rapport : ", error);
      alert("Une erreur est survenue lors de la soumission du rapport.");
    } finally {
      setIsLoading(false); // Arrêter le chargement
    }
  };
  

  const addActionField = () => {
    setActionsDone([...actionsDone, { description: "", photos: [] }]);
  };

  const removeActionField = (index) => {
    setActionsDone(actionsDone.filter((_, i) => i !== index));
  };

  const addRemarqueField = () => {
    setRemarques([...remarques, { remarque: "", photos: [] }]);
  };

  const removeRemarqueField = (index) => {
    setRemarques(remarques.filter((_, i) => i !== index));
  };

  return (
    <div className={styles.reportFormContainer}>
          {isLoading && <div className={styles.loading}>Chargement en cours...</div>}
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
          <label>Choisir les intervenants :</label>
          {intervenantsList.map((tech) => (
            <div key={tech.id}>
              <input
                type="checkbox"
                id={`intervenant-${tech.id}`}
                checked={intervenants.includes(tech.id)} // Cocher la case si le technicien est déjà sélectionné
                onChange={(e) => {
                  if (e.target.checked) {
                    setIntervenants((prev) => [...prev, tech.id]);
                  } else {
                    setIntervenants((prev) =>
                      prev.filter((id) => id !== tech.id)
                    );
                  }
                }}
              />
              <label htmlFor={`intervenant-${tech.id}`}>{tech.name}</label>
            </div>
          ))}
        </div>

        <h3>Actions menées</h3>
        {actionsDone.map((action, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Description des actions menées :</label>
            <input
              type="text"
              value={action.description}
              onChange={(e) => {
                const newActionsDone = [...actionsDone];
                newActionsDone[index].description = e.target.value;
                setActionsDone(newActionsDone);
              }}
              required
            />
            <label>Ajouter des photos pour cette action :</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleActionPhotoChange(index, e)}
              className={styles.uploadBtn}
            />
            <button type="button" onClick={() => removeActionField(index)}
              className={styles.removeBtn}
              >
              Supprimer cette action
            </button>
          </div>
        ))}
        <button type="button" onClick={addActionField}
        className={styles.addBtn}>
          Ajouter une action
        </button>

        <h3>Remarques </h3>
        {remarques.map((remarque, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Remarques :</label>
            <input
              type="text"
              value={remarque.remarque}
              onChange={(e) => {
                const newRemarques = [...remarques];
                newRemarques[index].remarque = e.target.value;
                setRemarques(newRemarques);
              }}
            />
            <label>Ajouter des photos pour cette remarque :</label>
            <input
              type="file"
              multiple
              onChange={(e) => handleRemarquePhotoChange(index, e)}
              className={styles.uploadBtn}
            />
            <button type="button" onClick={() => removeRemarqueField(index)}
              className={styles.removeBtn}>
              Supprimer cette remarque
            </button>
          </div>
        ))}
        <button type="button" onClick={addRemarqueField}
        className={styles.addBtn}>
          Ajouter une remarque
        </button>

        <h3>Risque(s) / Danger(s)</h3>
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

        <h3>Signature</h3>
        <div className={styles.formGroup}>
          <label>Nom du signataire :</label>
          <input
            type="text"
            value={signataireNom}
            onChange={(e) => setSignataireNom(e.target.value)}
          />
        </div>

        <Signature
          signatureUrl={signatureUrl}
          setSignatureUrl={setSignatureUrl}
          setIsSigned={setIsSigned}
        />

        <button className={styles.submitButton} type="submit">
          Créer le rapport
        </button>
      </form>
    </div>
  );
}
