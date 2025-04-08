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
            const response = await fetch('https://case-studies-generator-4ol1.vercel.app/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(inputData)
            });

            if (!response.ok) {
                const error = await response.json();
                generatedOutputDiv.textContent = `Error: ${response.status} - ${error.detail || 'Something went wrong'}`;
                return;
            }

            const output = await response.json();
            generatedOutputDiv.textContent = JSON.stringify(output.generated_case_study, null, 2);

        } catch (error) {
            generatedOutputDiv.textContent = `Fetch error: ${error}`;
        }
    });
});
