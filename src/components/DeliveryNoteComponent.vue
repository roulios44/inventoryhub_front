<!-- PDFGeneratorComponent.vue -->
<template>
    <div>
        <button @click="generatePDF">Télécharger le Bon de Commande en PDF</button>
    </div>
</template>

<script>
import jsPDF from 'jspdf';

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
            doc.text(`Bon de commande - ${this.entity.title || 'Sans titre'}`, 10, 10);

            // Informations client et date
            doc.setFontSize(12);
            doc.text(`Nom du client : ${this.entity.clientName || 'N/A'}`, 10, 30);
            doc.text(`Date : ${new Date().toLocaleDateString()}`, 10, 40);

            // Autres informations de l'entité
            let startY = 50;
            for (const [key, value] of Object.entries(this.entity)) {
                if (key !== 'links' && key !== 'password') {
                    startY += 10;
                    doc.text(`${this.formatKey(key)} : ${value}`, 10, startY);
                }
            }

            // Générer et télécharger le PDF
            doc.save(`bon_de_commande_${this.entity.title || 'sans_titre'}.pdf`);
        },
        formatKey(key) {
            return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        }
    }
};
</script>