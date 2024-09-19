<template>
    <div>
        <button @click="generatePDF">Télécharger le Bon de Commande en PDF</button>
    </div>
</template>

<script>
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default {
    props: {
        entity: {
            type: Object,
            required: true
        }
    },
    methods: {
        generatePDF() {
            const doc = new jsPDF();

            // Titre du bon de commande
            doc.setFontSize(18);
            doc.text(`Bon de commande - ${this.entity.orderNumber || 'Sans titre'}`, 10, 10);

            // Informations client et date
            doc.setFontSize(12);
            doc.text(`Nom du client : ${this.entity.user.email || 'N/A'}`, 10, 30);
            doc.text(`Date : ${new Date().toLocaleDateString()}`, 10, 40);

            let startY = 50;
            for (const [key, value] of Object.entries(this.entity)) {
                if (key !== 'links' && key !== 'password') {
                    startY = this.addContentToPDF(doc, key, value, startY);
                }
            }

            // Générer et télécharger le PDF
            doc.save(`bon_de_commande_${this.entity.orderNumber || 'sans_titre'}.pdf`);
        },
        addContentToPDF(doc, key, value, startY) {
            const lineHeight = 10;
            const pageHeight = doc.internal.pageSize.height;

            // Saut de page si nécessaire
            const checkPageEnd = () => {
                if (startY + lineHeight > pageHeight - 10) { // 10 = marge du bas
                    doc.addPage();
                    startY = 10; // Recommence en haut de la nouvelle page
                }
            };

            // Formatage de la clé
            const formattedKey = this.formatKey(key);

            if (Array.isArray(value)) {
                checkPageEnd();

                // Écrire le nom de la propriété au-dessus du tableau
                doc.text(`${formattedKey} :`, 10, startY);
                startY += lineHeight;

                // Préparer les données pour la table
                const tableData = value.map(item => {
                    const filteredData = [];
                    for (const [itemKey, itemValue] of Object.entries(item)) {
                        if (!["orderNumber", "_links"].includes(itemKey)) {
                            filteredData.push(`${itemKey}: ${itemValue}`);
                        }
                    }
                    return filteredData;
                });

                // Afficher la table dans le PDF
                doc.autoTable({
                    head: [[`Données du tableau pour ${formattedKey}`]],
                    body: tableData.map(row => [row.join(', ')]),
                    startY: startY,
                    margin: { top: 10, left: 10, right: 10 },
                });

                startY = doc.lastAutoTable.finalY + lineHeight;
            } else if (typeof value === 'object' && value !== null) {
                if (key == "user") doc.text(`Created by : ${value.email}`, 10, startY);
                else if (key == "warehouse") doc.text(`${formattedKey} : ${value.title}`, 10, startY);
                else if (key == "type") doc.text(`${formattedKey} : ${value.title}`, 10, startY);
                checkPageEnd();
                doc.text(`${formattedKey} :`, 10, startY);
                startY += lineHeight;
            } else {
                checkPageEnd();
                if (!["warehouseId", "userId", "typeId"].includes(key)) {
                    doc.text(`${formattedKey} : ${this.formatValue(value)}`, 10, startY);
                    startY += lineHeight;
                }
            }

            return startY;
        },
        formatKey(key) {
            return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        },
        formatValue(value) {
            if (typeof value === 'object' && value !== null) {
                return JSON.stringify(value, null, 2); // Formater les objets en JSON
            }
            return value;
        }
    }
};
</script>
