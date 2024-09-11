import { useState, useEffect } from 'react';
import styles from "./style.module.scss";

export default function IncidentForm({ initialData, onSubmit }) {
  const [client, setClient] = useState({
    email: '',
    nomEntreprise: '',
    tel: '',
  });
  const [site, setSite] = useState({
    adresse: '',
    fonctionContact: '',
    nomContact: '',
    telContact: '',
  });
  const [intervenant, setIntervenant] = useState('');
  const [photos, setPhotos] = useState([]);
  const [remarques, setRemarques] = useState([{ remarque: '' }]);
  const [risques, setRisques] = useState(false);
  const [actions, setActions] = useState(['']);
  const [createdAt, setCreatedAt] = useState(new Date().toISOString());

  useEffect(() => {
    if (initialData) {
      setClient(initialData.client || {});
      setSite(initialData.site || {});
      setIntervenant(initialData.intervenant || '');
      setPhotos(initialData.photos || []);
      setRemarques(initialData.remarques || [{ remarque: '' }]);
      setRisques(initialData.risques || false);
      setActions(initialData.actions || ['']);
      setCreatedAt(initialData.createdAt || new Date().toISOString());
    }
  }, [initialData]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setPhotos((prevPhotos) => [...prevPhotos, ...files]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const incidentData = {
      client,
      site,
      intervenant,
      photos,
      remarques,
      risques,
      actions,
      createdAt,
    };

    onSubmit(incidentData);
  };

  const addRemarqueField = () => {
    setRemarques([...remarques, { remarque: '' }]);
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
    setActions([...actions, '']);
  };

  const removeActionField = (index) => {
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleActionChange = (index, value) => {
    const newActions = [...actions];
    newActions[index] = value;
    setActions(newActions);
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
            onChange={(e) => setClient({ ...client, nomEntreprise: e.target.value })}
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
            onChange={(e) => setSite({ ...site, fonctionContact: e.target.value })}
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
          <label>Intervenant :</label>
          <input
            type="text"
            value={intervenant}
            onChange={(e) => setIntervenant(e.target.value)}
            required
          />
        </div>

        <h3>Actions</h3>
        {actions.map((action, index) => (
          <div key={index} className={styles.formGroup}>
            <label>Action :</label>
            <input
              type="text"
              value={action}
              onChange={(e) => handleActionChange(index, e.target.value)}
            />
            {actions.length > 1 && (
              <button
                type="button"
                onClick={() => removeActionField(index)}
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
            <label>Remarque :</label>
            <input
              type="text"
              value={remarque.remarque}
              onChange={(e) => handleRemarqueChange(index, e.target.value)}
            />
            {remarques.length > 1 && (
              <button
                type="button"
                onClick={() => removeRemarqueField(index)}
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
              </div>
            ))}
          </div>
        </div>

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

        <button className={styles.submitButton} type="submit">Soumettre</button>
      </form>
    </div>
  );
}
