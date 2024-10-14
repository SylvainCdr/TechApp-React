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

  // Fonction de filtrage des rapports sur le champ client.nomEntreprise et site.siteName
  const filteredReports = reports.filter(
    (report) =>
      (report.client?.nomEntreprise &&
        report.client.nomEntreprise
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (report.site?.siteName &&
        report.site.siteName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Fonction pour récupérer les rapports d'intervention depuis Firestore
  const fetchReports = async () => {
    try {
      // Requête pour récupérer les rapports triés par date de création (createdAt) décroissante
      const q = query(
        collection(db, "interventionReports"),
        orderBy("interventionStartDate", "desc")
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
      <h1>Recherche de rapport</h1>
      <input
        type="text"
        placeholder="Rechercher par site ou nom d'entreprise"
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
                <i className="fa-regular fa-building"></i> Nom du site
              </th>
              <th>
                <i className="fa-regular fa-building"></i>
              </th>
              <th>
                <i className="fa-regular fa-calendar-days"></i>
              </th>
              <th>
                <i className="fa-solid fa-user-group"></i>
              </th>
              <th className={styles.status}>
                <i className="fa-solid fa-wrench"></i>
              </th>
              <th>
                <i className="fa-solid fa-bars"></i>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.map((report) => (
              <tr key={report.id}>
                <td>{report.site?.siteName || "Non spécifié"}</td>
                <td>{report.client?.nomEntreprise || "Non spécifié"}</td>
                <td>
                  {new Date(report.interventionStartDate).toLocaleDateString(
                    "fr-FR"
                  ) ===
                  new Date(report.interventionEndDate).toLocaleDateString(
                    "fr-FR"
                  )
                    ? new Date(report.interventionStartDate).toLocaleDateString(
                        "fr-FR"
                      )
                    : `${new Date(
                        report.interventionStartDate
                      ).toLocaleDateString("fr-FR")} / ${new Date(
                        report.interventionEndDate
                      ).toLocaleDateString("fr-FR")}`}
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
                <td className={styles.status}>
                  {report.actionsDone?.length ? "Complété" : "À compléter"}
                </td>
                <td className={styles.tableActions}>
                  <Link to={`/report/${report.id}`} className={styles.viewBtn}>
                    <i className="fa-solid fa-eye"></i>
                  </Link>
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
