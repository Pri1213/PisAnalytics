var quizAnswers;

document.addEventListener('DOMContentLoaded', function() {
    const params = new URLSearchParams(window.location.search);

    quizAnswers = JSON.parse(params.get('answers')); 

    if (quizAnswers) {

        var mathsDiv = document.getElementById("mathsResult");
        var scienceDiv = document.getElementById("scienceResult");


        fetch("http://127.0.0.1:8000/predict", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(quizAnswers)
        })
        .then(response => {
            return response.json();
        })
        .then(result => {

            if (result.predicted_math_score) {
                result.predicted_math_score = (Math.round(result.predicted_math_score * 100) / 100).toFixed(2);
                mathsDiv.innerHTML = `Predicted Maths result: ${result.predicted_math_score}`;
            } else {
                mathsDiv.innerHTML = "Could not retrieve math score.";
            }

            if (result.predicted_science_score) {
                result.predicted_science_score = (Math.round(result.predicted_science_score * 100) / 100).toFixed(2);
                scienceDiv.innerHTML = `Predicted Science result: ${result.predicted_science_score}`;
            } else {
                scienceDiv.innerHTML = "Could not retrieve science score.";
            }
        })
        .catch(error => {
            console.error('Error: ', error);
            mathsDiv.innerHTML = "An error occurred while fetching the results.";
        });

    } else {
        console.log('No quiz answers found.');
    }
});
