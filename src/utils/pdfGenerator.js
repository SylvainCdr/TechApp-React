import { img } from "framer-motion/client";
import jsPDF from "jspdf";

const coverImg = "/assets/pix-bg.png";
const footerImg = "/assets/pix-footer.png";
const headerImg = "/assets/pix-header.png";

const interventionDates = (report) => {
  const startDate = new Date(report.interventionStartDate).toLocaleDateString(
    "fr-FR"
  );
  const endDate = new Date(report.interventionEndDate).toLocaleDateString(
    "fr-FR"
  );
  return startDate === endDate ? startDate : `${startDate} - ${endDate}`;
};

const getDataUri = (url) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.crossOrigin = "Anonymous"; // Important pour les images CORS
    image.onload = () => resolve(image);
    image.src = url;
  });
};

const generateReportPdf = async (report, technicians) => {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth(); // Largeur de la page
  const pageHeight = doc.internal.pageSize.getHeight(); // Hauteur de la page

  // -------------------------------------------------------------------------------------------------------
  // PAGE 1 : COUVERTURE DU RAPPORT
  doc.addImage(coverImg, "PNG", 0, 0, pageWidth, pageHeight); // Image en fond qui occupe toute la page
  doc.setFontSize(25);

  doc.setTextColor(255, 255, 255);
  doc.text("Rapport d'intervention", 105, 50, null, null, "center");
  doc.setFontSize(14);
  doc.text(
    "Date(s) : " + interventionDates(report),
    105,
    60,
    null,
    null,
    "center"
  );

  // Définition de la zone pour `nomEntreprise`
  const zoneWidth = pageWidth * 0.3; // 30% de la largeur de la page
  const zoneHeight = pageHeight * 0.15; // 15% de la hauteur de la page
  const zoneX = pageWidth * 0.62; // Décalage vers la droite (ajustez cette valeur pour affiner)
  const zoneY = pageHeight * 0.86; // Décalage vers le bas (ajustez cette valeur pour affiner)

  doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant
  doc.setFontSize(20);

  // Fonction pour charger l'image avec crossOrigin correctement placé
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "Anonymous"; // Important : placer ceci avant la définition de la source
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = url;
    });
  }

  const logoWidth = 50; // Largeur de l'image du logo
  const logoHeight = 30; // Hauteur de l'image du logo

  const addLogoOrCompanyName = async () => {
    if (report.client?.logoEntreprise) {
      try {
        const img = await loadImage(report.client.logoEntreprise);

        // Récupération des dimensions originales de l'image
        const originalWidth = img.width;
        const originalHeight = img.height;
        const aspectRatio = originalWidth / originalHeight;

        let displayWidth = logoWidth;
        let displayHeight = logoHeight;

        // Ajustement de la largeur ou de la hauteur pour garder le ratio
        if (originalWidth > originalHeight) {
          displayHeight = logoWidth / aspectRatio;
        } else {
          displayWidth = logoHeight * aspectRatio;
        }

        // Centrage du logo dans la zone définie
        const xPosition = zoneX + (logoWidth - displayWidth) / 2;
        const yPosition = zoneY + (logoHeight - displayHeight) / 2;

        // Ajout de l'image au PDF avec la taille ajustée
        doc.addImage(
          img,
          img.src.endsWith(".png") ? "PNG" : "JPEG",
          xPosition,
          yPosition,
          displayWidth,
          displayHeight
        );
      } catch (error) {
        console.error("Erreur lors du chargement du logo : ", error);
        displayCompanyName();
      }
    } else {
      displayCompanyName();
    }
  };

  function displayCompanyName() {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(20);
    doc.text(
      `${report.client?.nomEntreprise || "Nom du client"}`,
      zoneX + logoWidth / 2,
      zoneY + logoHeight / 2,
      { align: "center" }
    );
  }

  // Appel de la fonction et attente de sa complétion
  await addLogoOrCompanyName(); // Attendre que l'ajout du logo ou du nom soit terminé

  doc.addPage(); // Ajoute la page 2

  // -------------------------------------------------------------------------------------------------------
  // PAGE 2 : INFORMATIONS INTERVENTION
  doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date(s) : ${interventionDates(report)}`, 145, 7);
  doc.text(
    `Client : ${report.client?.nomEntreprise || "Nom du client"}`,
    145,
    12
  );
  doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant

  // Informations du client
  doc.setFontSize(18);
  doc.text("Informations client", 10, 50);
  doc.setFontSize(10);

  // Tableau des informations client
  const clientDetails = [
    { key: "Client", value: report.client?.nomEntreprise || "Nom du client" },
    { key: "Email", value: report.client?.email || "Email du client" },
    { key: "Téléphone", value: report.client?.tel || "Téléphone du client" },
  ];

  let startY = 60;
  const keyColumnWidth = 60;
  const valueColumnWidth = 130;
  clientDetails.forEach((detail, index) => {
    doc.setFontSize(12);
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(10, startY + index * 10, keyColumnWidth, 10, "FD");
    doc.rect(
      10 + keyColumnWidth,
      startY + index * 10,
      valueColumnWidth,
      10,
      "FD"
    );
    doc.text(detail.key, 12, startY + 7 + index * 10);
    doc.text(detail.value, 12 + keyColumnWidth, startY + 7 + index * 10);
  });

  // Détails de l'intervention
  doc.setFontSize(18);
  doc.text("Détails de l'intervention", 10, startY + 50);
  doc.setFontSize(10);

  const interventionDetails = [
    { key: "Nom du site", value: report.site?.siteName || "Nom du site" },
    { key: "Adresse", value: report.site?.adresse || "Adresse du site" },
    {
      key: "Nom du contact sur site",
      value: report.site?.nomContact || "Nom du contact",
    },
    {
      key: "Fonction du contact",
      value: report.site?.fonctionContact || "Fonction du contact",
    },
    {
      key: "Téléphone du contact",
      value: report.site?.telContact || "Téléphone du contact",
    },
    {
      key: "Intervenant(s) Pixecurity",
      value: report.intervenants
        ? report.intervenants
            .map((id) => technicians.find((tech) => tech.id === id)?.name)
            .join(", ")
        : "Aucun",
    },
    { key: "Risques identifiés", value: report.risques ? "Oui" : "Non" },
  ];

  let interventionStartY = startY + 60;
  interventionDetails.forEach((detail, index) => {
    doc.setFontSize(12);
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);

    // Utilise `splitTextToSize` pour gérer le retour à la ligne si le texte est trop long
    const wrappedText = doc.splitTextToSize(detail.value, valueColumnWidth - 4); // Ajustez la largeur pour éviter de toucher les bords
    const cellHeight = 10 * wrappedText.length; // Calcule la hauteur de la cellule en fonction du nombre de lignes

    // Dessine les cellules avec une hauteur dynamique
    doc.rect(10, interventionStartY, keyColumnWidth, cellHeight, "FD");
    doc.rect(
      10 + keyColumnWidth,
      interventionStartY,
      valueColumnWidth,
      cellHeight,
      "FD"
    );

    // Ajoute le texte dans les cellules
    doc.text(detail.key, 12, interventionStartY + 7); // Affichage de la clé
    doc.text(wrappedText, 12 + keyColumnWidth, interventionStartY + 7);

    interventionStartY += cellHeight; // Met à jour la position verticale pour la prochaine ligne
  });

  doc.addImage(footerImg, "PNG", 0, 276, 220, 0);
  // -------------------------------------------------------------------------------------------------------
  // PAGE 3 : ACTIONS AVEC PHOTOS EN TABLEAU
  // Ajoute la page 3

  doc.addPage();
  doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date(s) : ${interventionDates(report)}`, 145, 7);
  doc.text(
    `Client : ${report.client?.nomEntreprise || "Nom du client"}`,
    145,
    12
  );
  doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant

  doc.setFillColor(240, 240, 240); // Arrière-plan gris clair
  doc.rect(0, 15, 250, 10, "F"); // Rectangle rempli pour l'arrière-plan
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0); // Couleur du texte noire
  doc.text("Actions menées", 13, 22); // Ajuster la position du texte

  let yPosition = 27;
  const maxHeightPerPage = 265;
  // const imgWidthSmall = 80; // Largeur réduite des images
  // const imgHeightSmall = 160; // Hauteur réduite des images

  for (let index = 0; index < report.actionsDone.length; index++) {
    const action = report.actionsDone[index];
    const actionText = `Action ${index + 1} :`;
    const descriptionText = action.description;

    const pageWidth = doc.internal.pageSize.getWidth();
    const rectWidth = pageWidth * 0.9;

    doc.setFillColor(0, 51, 102); // Couleur de fond : bleu foncé
    doc.rect(10, yPosition, rectWidth, 6, "F"); // Rectangle avec 90% de la largeur de la page et hauteur 6

    doc.setTextColor(255, 255, 255); // Couleur blanche
    doc.setFontSize(12);
    doc.text(actionText, 11, yPosition + 5); // Afficher "Action *"

    doc.setTextColor(0, 0, 0);
    const wrappedDescription = doc.splitTextToSize(descriptionText, 190);
    yPosition += 12;
    doc.text(wrappedDescription, 10, yPosition);
    yPosition += wrappedDescription.length * 6;

    // Vérifiez si l'action a des photos associées
    if (action.photos && action.photos.length > 0) {
      for (let i = 0; i < action.photos.length; i++) {
        const photo = action.photos[i];
        const img = await getDataUri(photo);

        const maxWidth = 160;
        const maxHeight = 160;
        let newWidth, newHeight;

        // Ajuste les dimensions de l'image en fonction de son ratio
        if (img.width > img.height) {
          newWidth = maxWidth;
          newHeight = (img.height / img.width) * maxWidth;
        } else {
          newHeight = maxHeight;
          newWidth = (img.width / img.height) * maxHeight;
        }

        // Vérifiez si l'image dépasse la hauteur de la page
        if (yPosition + newHeight > maxHeightPerPage) {
          // Ajouter le pied de page avant de passer à la page suivante
          doc.addImage(footerImg, "PNG", 0, 276, 220, 0);
          doc.addPage();
          doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
          doc.setFontSize(11);
          doc.setTextColor(255, 255, 255);
          doc.text(`Date(s) : ${interventionDates(report)}`, 145, 7);
          doc.text(
            `Client : ${report.client?.nomEntreprise || "Nom du client"}`,
            145,
            12
          );

          doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant
          doc.setFontSize(16);
          doc.setFillColor(240, 240, 240);
          doc.rect(0, 15, 250, 10, "F"); // Rectangle rempli pour l'arrière-plan
          doc.text("Actions menées (suite)", 13, 22);

          // Réinitialiser la position Y pour la nouvelle page
          yPosition = 27;
        }

        // Ajouter l'image
        doc.addImage(img, "JPEG", 10, yPosition, newWidth, newHeight);
        yPosition += newHeight + 5; // Espace après chaque image
      }
    } else {
      // Espace supplémentaire si aucune photo
      yPosition += 5;
    }
  }

  // Ajouter le pied de page à la dernière page des actions
  doc.addImage(footerImg, "PNG", 0, 276, 220, 0);

  // -------------------------------------------------------------------------------------------------------
  // PAGE 4 : REMARQUES / RISQUES AVEC PHOTOS EN TABLEAU
  // Vérifiez si le rapport contient des remarques ou des photos associées
  if (report.remarques && report.remarques.length > 0) {
    doc.addPage();
    doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(`Date(s) : ${interventionDates(report)}`, 145, 7);
    doc.text(
      `Client : ${report.client?.nomEntreprise || "Nom du client"}`,
      145,
      12
    );
    doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant

    doc.setFillColor(240, 240, 240); // Arrière-plan gris clair
    doc.rect(0, 26, 250, 10, "F");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("Remarques", 13, 34);

    let yPositionRemark = 37;

    for (let index = 0; index < report.remarques.length; index++) {
      const remarque = report.remarques[index];
      const remarqueText = `Remarque ${index + 1} :`;
      const descriptionText = remarque.remarque;

      // Définir la couleur et le style pour le titre de la remarque
      const pageWidth = doc.internal.pageSize.getWidth();
      const rectWidth = pageWidth * 0.9;
      doc.setFillColor(0, 51, 102);
      doc.rect(10, yPositionRemark, rectWidth, 6, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.text(remarqueText, 11, yPositionRemark + 5);

      doc.setTextColor(0, 0, 0);
      const wrappedDescription = doc.splitTextToSize(descriptionText, 190);
      yPositionRemark += 12;
      doc.text(wrappedDescription, 10, yPositionRemark);
      yPositionRemark += wrappedDescription.length * 6;

      // Afficher les photos si elles existent
      if (remarque.photos && remarque.photos.length > 0) {
        for (let i = 0; i < remarque.photos.length; i++) {
          const photo = remarque.photos[i];
          const img = await getDataUri(photo);

          const maxWidth = 170;
          const maxHeight = 170;
          let newWidth, newHeight;

          // Ajustement des dimensions en fonction du ratio
          if (img.width > img.height) {
            newWidth = maxWidth;
            newHeight = (img.height / img.width) * maxWidth;
          } else {
            newHeight = maxHeight;
            newWidth = (img.width / img.height) * maxHeight;
          }

          // Vérifier si l'image dépasse la hauteur de la page
          if (yPositionRemark + newHeight > maxHeightPerPage) {
            doc.addImage(footerImg, "PNG", 0, 276, 220, 0);
            doc.addPage();
            doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
            doc.setFontSize(12);
            doc.setTextColor(255, 255, 255);
            doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
            doc.text(
              `Client : ${report.client?.nomEntreprise || "Nom du client"}`,
              130,
              20
            );
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(18);
            doc.setFillColor(240, 240, 240);
            doc.rect(0, 30, 250, 15, "F");
            doc.text("Remarques (suite)", 20, 40);

            yPositionRemark = 50;
          }

          // Affichage de l'image avec les dimensions ajustées
          doc.addImage(img, "JPEG", 10, yPositionRemark, newWidth, newHeight);
          yPositionRemark += newHeight + 10; // Espace après l'image
        }
      }

      // Espacement entre les remarques
      yPositionRemark += 10;
    }

    // Ajouter le pied de page à la dernière page des remarques
    doc.addImage(footerImg, "PNG", 0, 276, 220, 0);
  }

  // -------------------------------------------------------------------------------------------------------
  // -------------------------------------------------------------------------------------------------------
  // SIGNATURE DU CLIENT
  doc.addPage(); // Ajoute la page suivante
  doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date(s) : ${interventionDates(report)}`, 145, 7);
  doc.text(
    `Client : ${report.client?.nomEntreprise || "Nom du client"}`,
    145,
    12
  );
  doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant

  doc.setFillColor(240, 240, 240); // Arrière-plan gris clair
  doc.rect(0, 30, 250, 15, "F"); // Rectangle rempli pour l'arrière-plan
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0); // Couleur du texte noire
  doc.text("Signature du client", 20, 40);

  doc.setFontSize(12);
  doc.text(`Rapport signé : ${report.isSigned ? "Oui" : "Non"}`, 20, 60);
  doc.text(`Nom du signataire : ${report.signataireNom || ""}`, 20, 70);

  // Vérification de la présence de la signature
  if (report.signatureUrl) {
    // Intégration de l'image de signature en base64 si elle est disponible
    const imgSign = await getDataUri(report.signatureUrl);
    doc.addImage(imgSign, "JPEG", 20, 80, 70, 0);
  } else {
    // Affichage d'un message si la signature n'est pas disponible
    doc.setTextColor(255, 0, 0); // Couleur du texte rouge pour indiquer l'absence de signature
    doc.text("Signature non disponible à la génération du rapport", 20, 80);
  }

  // Ajouter le pied de page à la dernière page
  doc.addImage(footerImg, "PNG", 0, 255, 220, 0);

  // -------------------------------------------------------------------------------------------------------
  // AJOUT DE LA PAGINATION
  // Maintenant que toutes les pages sont créées, vous pouvez obtenir le nombre total de pages
  const totalPages = doc.getNumberOfPages();

  // Parcourez chaque page pour ajouter le numéro de page
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(171, 171, 171);
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - 22, pageHeight - 5); // Positionne au bas de la page à droite
  }

  // Sauvegarder le PDF
  doc.save(
    `RAPPORT INTERVENTION - ${report.client?.nomEntreprise} (${
      report.site?.siteName
    }) - ${interventionDates(report)}.pdf`
  );
};

export default generateReportPdf;
