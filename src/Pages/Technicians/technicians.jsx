import { useState, useEffect } from "react";
import Swal from "sweetalert2";
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
import { motion } from "framer-motion";

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

        Swal.fire({
          title: "Succès",
          text: "Technicien mis à jour avec succès !",
          icon: "success",
          confirmButtonText: "OK",
        });
      } else {
        // Création d'un nouveau technicien
        await addDoc(collection(db, "technicians"), data);

        Swal.fire({
          title: "Succès",
          text: "Technicien ajouté avec succès !",
          icon: "success",
          confirmButtonText: "OK",
        });
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
      Swal.fire({
        title: "Erreur",
        text: "Une erreur est survenue lors de la soumission du formulaire.",
        icon: "error",
        confirmButtonText: "OK",
      });
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

  // Fonction pour gérer la suppression d'un technicien avec SweetAlert2
  const handleDelete = async (technician) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Cette action est irréversible !",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    });

    if (result.isConfirmed) {
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

        Swal.fire("Supprimé !", "Le technicien a été supprimé.", "success");
        fetchTechnicians();
      } catch (error) {
        console.error("Erreur lors de la suppression du technicien : ", error);
        Swal.fire({
          title: "Erreur",
          text: "Une erreur est survenue lors de la suppression.",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
  };

  return (
    <div className={styles.techniciansContainer}>
      <h1>Gestion des Techniciens</h1>

      {/* Bouton pour afficher ou cacher le formulaire */}
      <button onClick={() => setShowForm(!showForm)}>
        {showForm ? "Fermer le formulaire" : "  Ajouter un technicien"}
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
            <label> Fonction :</label>
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

      <div className={styles.techniciansList}>
        {technicians.map((technician) => (
          <div key={technician.id} className={styles.technicianItem}>
            <h2>
              {technician.firstName} {technician.lastName}
            </h2>
            {technician.urlPhoto && (
              <motion.img
                src={technician.urlPhoto}
                alt={`${technician.firstName} ${technician.lastName}`}
                initial={{ scale: 0 }}
                animate={{ rotate: 360, scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20
                }}
              />
            )}
            <p>
              {" "}
              <i class="fa-regular fa-id-card"></i>Fonction : {technician.role}
            </p>
            <p>
              {" "}
              <i class="fa-solid fa-phone"></i>Téléphone : {technician.phone}
            </p>
            <p>
              {" "}
              <i class="fa-solid fa-at"></i>Email : {technician.email}
            </p>
            <div className={styles.buttons}>
              <button
                className={styles.editButton}
                onClick={() => handleEdit(technician)}
              >
               <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button
                className={styles.deleteButton}
                onClick={() => handleDelete(technician)}
              >
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
