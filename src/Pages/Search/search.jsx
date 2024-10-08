import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styles from "./style.module.scss";
import { getDocs, collection, query, orderBy } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import { motion } from "framer-motion";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [reports, setReports] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  // Fonction de filtrage des rapports sur le champ nomEntreprise uniquement
  const filteredReports = reports.filter((report) =>
    report.client.nomEntreprise.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour récupérer les rapports d'intervention depuis Firestore
  const fetchReports = async () => {
    try {
      // Requête pour récupérer les rapports triés par date de création (createdAt) décroissante
      const q = query(
        collection(db, "interventionReports"),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      const reportsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReports(reportsList);
      const techniciansSnapshot = await getDocs(collection(db, "technicians"));
      const techniciansList = techniciansSnapshot.docs.map((doc) => ({
        id: doc.id,
        name: `${doc.data().firstName} ${doc.data().lastName}`,
        urlPhoto: doc.data().urlPhoto,
      }));
      setTechnicians(techniciansList);
    } catch (error) {
      console.error("Erreur lors de la récupération des rapports : ", error);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  return (
    <div className={styles.searchContainer}>
      <h1> Recherche de rapport</h1>
      <input
        type="text"
        placeholder="Rechercher par nom d'entreprise"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.searchInput}
      />

      {filteredReports.length > 0 ? (
        <motion.table
          className={styles.reportTable}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <thead>
            <tr>
              <th>
                <i class="fa-regular fa-building"></i>
              </th>
              <th>
                <i class="fa-regular fa-calendar-days"></i>
              </th>

              <th>
                <i class="fa-solid fa-user-group"></i>
              </th>
              <th>
                <i class="fa-solid fa-bars"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td>{report.client.nomEntreprise}</td>
                <td>
                  {new Date(report.interventionStartDate).toLocaleDateString(
                    "fr-FR"
                  ) ===
                  new Date(report.interventionEndDate).toLocaleDateString(
                    "fr-FR"
                  )
                    ? new Date(report.interventionStartDate).toLocaleDateString(
                        "fr-FR"
                      ) // Si les dates sont identiques
                    : `${new Date(
                        report.interventionStartDate
                      ).toLocaleDateString("fr-FR")} / ${new Date(
                        report.interventionEndDate
                      ).toLocaleDateString("fr-FR")}`}{" "}
                </td>

                <td>
                  {report.intervenants
                    .map((intervenant) => {
                      const technician = technicians.find(
                        (tech) => tech.id === intervenant
                      );
                      return technician
                        ? technician.name
                        : "Technicien introuvable";
                    })
                    .join(", ")}
                </td>
                <td>
                  <Link to={`/report/${report.id}`} className={styles.viewBtn}>
                    <i class="fa-solid fa-eye"></i>
                  </Link>

                  {!report.isSigned && (
                    <Link
                      to={`/reports/edit/${report.id}`}
                      className={styles.editBtn}
                    >
                      <i class="fa-solid fa-edit"></i>
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </motion.table>
      ) : (
        <p>Aucun rapport trouvé</p>
      )}
    </div>
  );
}
