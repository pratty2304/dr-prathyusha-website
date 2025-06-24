document.addEventListener('DOMContentLoaded', () => {
    const rawOcrTextField = document.getElementById('rawOcrText');
    const llmSummaryField = document.getElementById('llmSummary');
    
    // Patient Details
    const patientName = document.getElementById('patientName');
    const patientAge = document.getElementById('patientAge');
    const patientSex = document.getElementById('patientSex');
    const patientPhone = document.getElementById('patientPhone');
    const patientEmail = document.getElementById('patientEmail');

    // Retrieve data from sessionStorage
    const extractedText = sessionStorage.getItem('ocrText');
    const patientData = JSON.parse(sessionStorage.getItem('patientData'));

    if (patientData) {
        patientName.textContent = patientData.fullName || 'N/A';
        patientAge.textContent = patientData.age || 'N/A';
        patientSex.textContent = patientData.sex || 'N/A';
        patientPhone.textContent = patientData.phone || 'N/A';
        patientEmail.textContent = patientData.email || 'N/A';
    }

    if (extractedText) {
        rawOcrTextField.textContent = extractedText;
        // This is where you would make a real API call to your backend
        simulateLLMapiCall(extractedText);
    } else {
        rawOcrTextField.textContent = 'No text was extracted. Please go back and upload reports.';
        llmSummaryField.innerHTML = '<p>Could not generate summary because no text was extracted.</p>';
        llmSummaryField.classList.remove('loading');
    }

    // --- MOCK BACKEND CALL ---
    // In a real application, this function would be an async fetch() to your server.
    function simulateLLMapiCall(text) {
        console.log("Simulating LLM API call with extracted text:", text);
        
        // Mocked response after a delay
        setTimeout(() => {
            const summary = generateMockSummary(text);
            llmSummaryField.innerHTML = summary;
            llmSummaryField.classList.remove('loading');
        }, 4000); // Simulate network and processing delay
    }

    function generateMockSummary(text) {
        // This is a simplified mock summary generator.
        // A real LLM would provide a much more coherent and medically relevant summary.
        const patientName = patientData.fullName || "The patient";

        return `
            <h3>Patient Summary: ${patientName}</h3>
            <p>Based on the provided reports, here is a preliminary summary:</p>
            <ul>
                <li><strong>Primary Concern:</strong> The patient's main concern revolves around [Mocked Primary Concern, e.g., a recent diagnosis of adenocarcinoma].</li>
                <li><strong>Key Findings:</strong> Analysis of the reports suggests [Mocked Key Findings, e.g., a 2.5cm mass in the upper lobe of the left lung, as noted in a CT scan from [Date]]. Pathlogy reports indicate [Mocked Pathology, e.g., moderately differentiated cells].</li>
                <li><strong>Treatment History:</strong> The patient has undergone [Mocked Treatment, e.g., an initial course of chemotherapy with Cisplatin].</li>
                <li><strong>Potential Areas for Second Opinion:</strong>
                    <ul>
                        <li>Evaluation of alternative targeted therapies based on biomarker analysis.</li>
                        <li>Consideration of immunotherapy options.</li>
                        <li>Review of surgical margins and post-operative care plan.</li>
                    </ul>
                </li>
            </ul>
            <p><strong>Disclaimer:</strong> This is an AI-generated mock summary and should not be used for medical decisions. It is intended as a demonstration of LLM capabilities. A thorough review of the original documents by a qualified medical professional is required.</p>
        `;
    }

    // Print functionality
    const printBtn = document.getElementById('printSummaryBtn');
    printBtn.addEventListener('click', () => {
        window.print();
    });
}); 