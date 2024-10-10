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
const zoneX = (pageWidth * 0.57); // Décalage vers la droite (ajustez cette valeur pour affiner)
const zoneY = (pageHeight * 0.83); // Décalage vers le bas (ajustez cette valeur pour affiner)



doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant
doc.setFontSize(20);

// Centrage du texte à l'intérieur de la zone définie
doc.text(
  `${report.client?.nomEntreprise || "Nom du client"}`,
  zoneX + zoneWidth / 2, // Centre du rectangle en largeur
  zoneY + zoneHeight / 2, // Centre du rectangle en hauteur
  null,
  null,
  "center"
);


  doc.addPage(); // Ajoute la page 2

  // -------------------------------------------------------------------------------------------------------
  // PAGE 2 : INFORMATIONS INTERVENTION
  doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
  doc.text(
    `Client : ${report.client?.nomEntreprise || "Nom du client"}`,
    130,
    20
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
  { key: "Site", value: report.site?.adresse || "Adresse du site" },
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
  doc.rect(10 + keyColumnWidth, interventionStartY, valueColumnWidth, cellHeight, "FD");

  // Ajoute le texte dans les cellules
  doc.text(detail.key, 12, interventionStartY + 7); // Affichage de la clé
  doc.text(wrappedText, 12 + keyColumnWidth, interventionStartY + 7);

  interventionStartY += cellHeight; // Met à jour la position verticale pour la prochaine ligne
});



  doc.addImage(footerImg, "PNG", 0, 255, 220, 0);

 // PAGE 3 : ACTIONS MENÉES AVEC PHOTOS EN TABLEAU

// Ajoute la page 3
doc.addPage(); 
doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
doc.setFontSize(12);
doc.setTextColor(255, 255, 255);
doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
doc.setTextColor(0, 0, 0);

doc.setFillColor(240, 240, 240); // Arrière-plan gris clair
doc.rect(0, 30, 250, 15, "F"); // Rectangle rempli pour l'arrière-plan
doc.setFontSize(18);
doc.setTextColor(0, 0, 0); // Couleur du texte noire
doc.text("Actions menées", 20, 40); // Ajuster la position du texte

let yPosition = 50;
const maxHeightPerPage = 260;
const imgWidthSmall = 90; // Largeur réduite des images lorsqu'elles sont affichées deux par ligne
const imgHeightSmall = 65; // Hauteur réduite des images

for (let index = 0; index < report.actionsDone.length; index++) {
  const action = report.actionsDone[index];
  const actionText = `Action ${index + 1} : ${action.description}`;

  // Affichage de la description de l'action au-dessus des photos
  const wrappedText = doc.splitTextToSize(actionText, 270); // Utilise toute la largeur pour la description
  doc.setFontSize(12);
  doc.text(wrappedText, 10, yPosition + 10); // Position de la description au-dessus des photos
  yPosition += 15; // Incrémente la position Y après la description

  // Vérifiez si l'action a des photos associées
  if (action.photos && action.photos.length > 0) {
    let photoXPosition = 10; // Position initiale X pour les photos
    let photoYPosition = yPosition;

    // Affichage des photos, deux par ligne
    for (let i = 0; i < action.photos.length; i++) {
      const photo = action.photos[i];
      const img = await getDataUri(photo);

      // Vérifie si la position Y dépasse la limite de la page
      if (photoYPosition + imgHeightSmall > maxHeightPerPage) {
        // Ajouter le pied de page avant de changer de page
        doc.addImage(footerImg, "PNG", 0, 255, 220, 0);

        // Ajouter une nouvelle page
        doc.addPage();
        doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
        doc.setTextColor(255, 255, 255);
        doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
        doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(18);
        doc.setFillColor(240, 240, 240); // Arrière-plan gris clair
        doc.rect(0, 30, 250, 15, "F"); // Rectangle rempli pour l'arrière-plan
        doc.text("Actions menées (suite)", 20, 40);

        // Réinitialise la position Y après le titre pour commencer en haut de la page
        photoYPosition = 60;
        yPosition = 60;
      }

      // Ajouter l'image à la position calculée
      doc.addImage(img, "JPEG", photoXPosition, photoYPosition, imgWidthSmall, imgHeightSmall);

      // Passe à la colonne suivante si deux images sont déjà affichées sur la même ligne
      if (photoXPosition === 10) {
        photoXPosition = 110; // Position X pour la deuxième colonne
      } else {
        // Retour à la première colonne et passe à la ligne suivante
        photoXPosition = 10;
        photoYPosition += imgHeightSmall + 50; // Incrémente la position Y pour la ligne suivante
      }
    }

    // Met à jour la position Y pour les actions suivantes
    yPosition = photoYPosition + imgHeightSmall + 20;
  }
}

// Ajouter le pied de page à la dernière page des actions
doc.addImage(footerImg, "PNG", 0, 255, 220, 0);

// -------------------------------------------------------------------------------------------------------
// PAGE 4 : REMARQUES AVEC PHOTOS EN TABLEAU

// Vérifiez si le rapport contient des remarques ou des photos associées
const hasRemarques = report.remarques && report.remarques.some(remarque => remarque.remarque || (remarque.photos && remarque.photos.length > 0));

if (hasRemarques) {
  let yPositionRemark = 50; // Position initiale Y après le titre

  doc.addPage(); // Ajoute la page 4
  doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
  doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
  doc.setTextColor(0, 0, 0);

  doc.setFontSize(18);
  doc.setFillColor(240, 240, 240); // Arrière-plan gris clair
  doc.rect(0, 30, 250, 15, "F"); // Rectangle rempli pour l'arrière-plan
  doc.setTextColor(0, 0, 0); // Couleur du texte noire
  doc.text("Remarques", 20, 40); // Titre des remarques

  for (let index = 0; index < report.remarques.length; index++) {
    const remarque = report.remarques[index];
    const remarqueText = `Remarque ${index + 1} : ${remarque.remarque}`;

    // Affichage de la remarque au-dessus des photos
    const wrappedText = doc.splitTextToSize(remarqueText, 270); // Utilise toute la largeur pour la remarque
    doc.setFontSize(12);
    doc.text(wrappedText, 10, yPositionRemark + 10); // Position de la description au-dessus des photos
    yPositionRemark += 20; // Incrémente la position Y après la remarque

    // Vérifiez si la remarque a des photos associées
    if (remarque.photos && remarque.photos.length > 0) {
      let photoXPosition = 10; // Position initiale X pour les photos
      let photoYPosition = yPositionRemark;
      const imgWidthSmall = 80; // Largeur réduite des images lorsqu'elles sont affichées deux par ligne
      const imgHeightSmall = 60; // Hauteur réduite des images

      // Affichage des photos, deux par ligne
      for (let i = 0; i < remarque.photos.length; i++) {
        const photo = remarque.photos[i];
        const img = await getDataUri(photo);

        // Vérifie si la position Y dépasse la limite de la page
        if (photoYPosition + imgHeightSmall > maxHeightPerPage) {
          // Ajouter le pied de page avant de changer de page
          doc.addImage(footerImg, "PNG", 0, 255, 220, 0);

          // Ajouter une nouvelle page
          doc.addPage();
          doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
          doc.setTextColor(255, 255, 255);
          doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
          doc.text(`Client : ${report.client?.nomEntreprise || "Nom du client"}`, 130, 20);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(18);
          doc.setFillColor(240, 240, 240); // Arrière-plan gris clair
          doc.rect(0, 30, 250, 15, "F"); // Rectangle rempli pour l'arrière-plan
          doc.text("Remarques (suite)", 20, 40);

          // Réinitialise la position Y après le titre pour commencer en haut de la page
          photoYPosition = 60;
          yPositionRemark = 60;
        }

        // Ajouter l'image à la position calculée
        doc.addImage(img, "JPEG", photoXPosition, photoYPosition, imgWidthSmall, imgHeightSmall);

        // Passe à la colonne suivante si deux images sont déjà affichées sur la même ligne
        if (photoXPosition === 10) {
          photoXPosition = 110; // Position X pour la deuxième colonne
        } else {
          // Retour à la première colonne et passe à la ligne suivante
          photoXPosition = 10;
          photoYPosition += imgHeightSmall + 10; // Incrémente la position Y pour la ligne suivante
        }
      }

      // Met à jour la position Y pour les remarques et les photos suivantes
      yPositionRemark = photoYPosition + imgHeightSmall + 20;
    }
  }

  // Ajouter le pied de page à la dernière page des remarques
  doc.addImage(footerImg, "PNG", 0, 255, 220, 0);
}



  // -------------------------------------------------------------------------------------------------------
 // -------------------------------------------------------------------------------------------------------
// SIGNATURE DU CLIENT
doc.addPage(); // Ajoute la page suivante
doc.addImage(headerImg, "PNG", 0, 0, 220, 0);
doc.setFontSize(12);
doc.setTextColor(255, 255, 255);
doc.text(`Date(s) : ${interventionDates(report)}`, 130, 10);
doc.text(
  `Client : ${report.client?.nomEntreprise || "Nom du client"}`,
  130,
  20
);
doc.setTextColor(0, 0, 0); // Couleur noire pour le texte suivant

doc.setFillColor(240, 240, 240); // Arrière-plan gris clair
doc.rect(0, 30, 250, 15, "F"); // Rectangle rempli pour l'arrière-plan
doc.setFontSize(18);
doc.setTextColor(0, 0, 0); // Couleur du texte noire
doc.text("Signature du client", 20, 40);

doc.setFontSize(12);
doc.text(`Rapport signé : ${report.isSigned ? "Oui" : "Non"}`, 20, 60);
doc.text(
  `Nom du signataire : ${report.signataireNom || ""}`,
  20,
  70
);

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
    doc.text(`Page ${i} / ${totalPages}`, pageWidth - 23, pageHeight - 10); // Positionne au bas de la page à droite
  }

  // Sauvegarder le PDF
  doc.save(`rapport_intervention_${report.id}.pdf`);
};

export default generateReportPdf;
