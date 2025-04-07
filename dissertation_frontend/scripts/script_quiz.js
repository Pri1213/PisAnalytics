document.addEventListener('DOMContentLoaded', function() {
    const startButton = document.getElementById('button');
    const questionContainer = document.getElementById('questionContainer');
    const titleContainer = document.getElementById('titleContainer');
    const introduction = document.getElementById('introduction');
    const questionCategory = document.getElementById('questionCategory');
    const questionText = document.getElementById('questionText');
    const questionSlider = document.getElementById('questionSlider');
    const nextButton = document.getElementById('nextButton');
    const submitButton = document.getElementById('submitButton');

    let currentQuestionIndex = 0;
    let questions = [];
    let answers = {};

    startButton.addEventListener('click', function() {
        titleContainer.style.display = 'none';
        introduction.style.display = 'none';
        startButton.style.display = 'none';
        questionContainer.style.display = 'block';

        fetch('../questions.json')
            .then(response => response.json())
            .then(data => {
                for (const category in data) {
                    data[category].forEach((question, index) => {
                        questions.push({
                            question: ` ${index + 1}. ${question.question}`,
                            category,
                            code: question.code // Ensure the question code is stored
                        });
                    });
                }
                
                displayQuestion();
            })
            .catch(error => console.error('Error fetching JSON:', error));
    });

    nextButton.addEventListener('click', function() {
        const currentQuestion = questions[currentQuestionIndex];
        answers[currentQuestion.code] = parseInt(questionSlider.value);

        currentQuestionIndex++;
        if (currentQuestionIndex < questions.length) {
            displayQuestion();
        } else {
            nextButton.style.display = 'none';
            submitButton.style.display = 'block';
        }
    });

    submitButton.addEventListener('click', function() {
        console.log('data = ', answers);
        const params = new URLSearchParams({answers: JSON.stringify(answers)});

        window.location.href = `QuizResult.html?${params.toString()}`;
    });

    function displayQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        questionCategory.textContent = currentQuestion.category + ' Questions';
        questionText.textContent = currentQuestion.question;
        questionSlider.value = 1; 
        questionSlider.style.background = 'linear-gradient(to right, #ff0065 0%, #d3d3d3 0%)';
    }
});
