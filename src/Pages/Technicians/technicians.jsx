import { useState, useEffect } from "react";
import { db, storage } from "../../firebase/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import styles from "./style.module.scss";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    role: "",
    phone: "",
    email: "",
    urlPhoto: "",
  });
  const [editId, setEditId] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [showForm, setShowForm] = useState(false); // État pour afficher ou non le formulaire

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

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let photoURL = formData.urlPhoto;

      if (photo) {
        // Téléversement de la photo dans Firebase Storage
        const photoRef = ref(storage, `technicians/${photo.name}`);
        await uploadBytes(photoRef, photo);
        photoURL = await getDownloadURL(photoRef);
      }

      const data = { ...formData, urlPhoto: photoURL };

      if (editId) {
        // Mise à jour d'un technicien existant
        const technicianRef = doc(db, "technicians", editId);
        await updateDoc(technicianRef, data);
        alert("Technicien mis à jour avec succès !");
      } else {
        // Création d'un nouveau technicien
        await addDoc(collection(db, "technicians"), data);
        alert("Technicien ajouté avec succès !");
      }

      // Réinitialisation du formulaire et des états
      setFormData({
        firstName: "",
        lastName: "",
        role: "",
        phone: "",
        email: "",
        urlPhoto: "",
      });
      setPhoto(null);
      setEditId(null);
      setShowForm(false); // Fermer le formulaire après la soumission
      fetchTechnicians();
    } catch (error) {
      console.error(
        "Erreur lors de l'ajout ou de la mise à jour du technicien : ",
        error
      );
    }
  };

  // Fonction pour remplir le formulaire pour la modification
  const handleEdit = (technician) => {
    setFormData({
      firstName: technician.firstName,
      lastName: technician.lastName,
      role: technician.role,
      phone: technician.phone,
      email: technician.email,
      urlPhoto: technician.urlPhoto,
    });
    setEditId(technician.id);
    setShowForm(true); // Ouvrir le formulaire en mode édition
  };

  // Fonction pour gérer le changement de photo
  const handlePhotoChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  // Fonction pour gérer la suppression d'un technicien
  const handleDelete = async (technician) => {
    try {
      // Supprimer la photo associée
      if (technician.urlPhoto) {
        const fileName = decodeURIComponent(
          technician.urlPhoto.split("/").pop().split("?")[0]
        );
        const photoRef = ref(storage, `${fileName}`);
        await deleteObject(photoRef);
      }

      // Supprimer le technicien de Firestore
      const technicianRef = doc(db, "technicians", technician.id);
      await deleteDoc(technicianRef);

      alert("Technicien supprimé avec succès !");
      fetchTechnicians();
    } catch (error) {
      console.error("Erreur lors de la suppression du technicien : ", error);
    }
  };

  return (
    <div className={styles.techniciansContainer}>
      <h1>Gestion des Techniciens</h1>

      {/* Bouton pour afficher ou cacher le formulaire */}
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Fermer le formulaire" : " Ajouter un technicien"}
      </button>

      {/* Formulaire qui s'affiche si showForm est vrai */}
      {showForm && (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label>Prénom :</label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) =>
                setFormData({ ...formData, firstName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Nom :</label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) =>
                setFormData({ ...formData, lastName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Fonction :</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Téléphone :</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Email :</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label>Photo :</label>
            <input type="file" onChange={handlePhotoChange} />
          </div>
          <button type="submit">{editId ? "Mettre à jour" : "Ajouter"}</button>
        </form>
      )}

      <ul className={styles.techniciansList}>
        {technicians.map((technician) => (
          <li key={technician.id} className={styles.technicianItem}>
            <h2>
              {technician.firstName} {technician.lastName}
            </h2>
            {technician.urlPhoto && (
              <img
                src={technician.urlPhoto}
                alt={`${technician.firstName} ${technician.lastName}`}
              />
            )}
            <p>Fonction : {technician.role}</p>
            <p>Téléphone : {technician.phone}</p>
            <p>Email : {technician.email}</p>
            <div className={styles.buttons}>
              <button
                className={styles.editButton}
                onClick={() => handleEdit(technician)}
              >
                Modifier
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(technician)}
              >
                Supprimer
              </button>
            </div>{" "}
          </li>
        ))}
      </ul>
    </div>
  );
}
