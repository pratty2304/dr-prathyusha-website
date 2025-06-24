// summary.js

function generatePDFSummary(formData, files) {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
    });

    // --- PDF Styling ---
    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    let y = margin;

    // --- Header ---
    function addHeader() {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Patient Medical Summary', pageWidth / 2, y, { align: 'center' });
        y += 8;

        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, y, { align: 'center' });
        y += 15;

        // Add a decorative line
        doc.setDrawColor(0, 122, 255);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);
        y += 15;
    }

    // --- Footer ---
    function addFooter() {
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(10);
            doc.setTextColor(150, 150, 150);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
            doc.text('Dr. Prathyusha Eaga - Confidential', margin, pageHeight - 10);
        }
    }
    
    // --- Section Styling ---
    function addSectionTitle(title) {
        if (y > pageHeight - 40) { // Add new page if not enough space
            doc.addPage();
            y = margin;
            addHeader();
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.setTextColor(0, 122, 255);
        doc.text(title, margin, y);
        y += 8;
    }

    function addContent(label, value) {
        if (!value) return; // Skip if no value
        if (y > pageHeight - 20) {
            doc.addPage();
            y = margin;
        }
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text(label, margin, y);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);
        const textLines = doc.splitTextToSize(value, pageWidth - margin * 2 - 25);
        doc.text(textLines, margin + 25, y);
        y += textLines.length * 5 + 5;
    }

    function addLongText(text) {
        if (!text) return;
        if (y > pageHeight - 30) {
            doc.addPage();
            y = margin;
        }
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(80, 80, 80);
        const textLines = doc.splitTextToSize(text, pageWidth - margin * 2);
        doc.text(textLines, margin, y);
        y += textLines.length * 5 + 10;
    }

    // --- Start PDF Generation ---
    addHeader();

    // --- Personal Information ---
    addSectionTitle('Personal Information');
    addContent('Full Name:', formData.get('fullName'));
    addContent('Age:', formData.get('age'));
    addContent('Sex:', formData.get('sex'));
    addContent('Phone:', formData.get('phone'));
    addContent('Email:', formData.get('email'));
    y += 5;

    // --- Detailed Concern ---
    addSectionTitle('Detailed Medical Concern');
    addLongText(formData.get('concernDescription'));
    
    // --- Uploaded Files ---
    addSectionTitle('Uploaded Documents');
    if (files.length > 0) {
        files.forEach(file => {
            if (y > pageHeight - 20) {
                doc.addPage();
                y = margin;
            }
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(11);
            doc.setTextColor(80, 80, 80);
            doc.text(`- ${file.name} (${(file.size / 1024).toFixed(2)} KB)`, margin + 5, y);
            y += 7;
        });
    } else {
        addLongText('No documents were uploaded.');
    }

    // --- Footer ---
    addFooter();

    // --- Save the PDF ---
    doc.save(`Medical_Summary_${formData.get('fullName').replace(/\s/g, '_')}.pdf`);
} 