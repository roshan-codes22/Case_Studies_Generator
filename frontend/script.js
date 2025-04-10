document.addEventListener('DOMContentLoaded', () => {

    const generateButton = document.getElementById('generate-button');
    const clientNameInput = document.getElementById('client_name');
    const clientRequirementsInput = document.getElementById('client_requirements');
    const challengesFacedInput = document.getElementById('challenges_faced');
    const solutionProvidedInput = document.getElementById('solution_provided');
    const resultsAchievedInput = document.getElementById('results_achieved');
    const generatedOutputDiv = document.getElementById('generated-output');

    generateButton.addEventListener('click', async () => {

        const clientName = clientNameInput.value.trim();
        const clientRequirements = clientRequirementsInput.value.split('\n').filter(item => item.trim() !== '');
        const challengesFaced = challengesFacedInput.value.split('\n').filter(item => item.trim() !== '');
        const solutionProvided = solutionProvidedInput.value.split('\n').filter(item => item.trim() !== '');
        const resultsAchieved = resultsAchievedInput.value.split('\n').filter(item => item.trim() !== '');

        const inputData = {
            client_name: clientName || null,
            client_requirements: clientRequirements,
            challenges_faced: challengesFaced,
            solution_provided: solutionProvided,
            results_achieved: resultsAchieved
        };

        try {
            const response = await fetch('https://case-study-backend-w20q.onrender.com/generate_case_study', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputData)
            });

            let responseBody;

            try {
                responseBody = await response.clone().json();
            } catch (jsonError) {
                responseBody = await response.text();
            }

            if (!response.ok) {
                generatedOutputDiv.textContent = `Error: ${response.status} - ${responseBody?.detail || responseBody || 'Something went wrong'}`;
                return;
            }

            generatedOutputDiv.textContent = JSON.stringify(responseBody.generated_case_study, null, 2);

        } catch (error) {
            generatedOutputDiv.textContent = `Fetch error: ${error}`;
        }
    });
});
