import CONFIG from './config.js';
const API_KEY = CONFIG.GEMINI_KEY;
let selection = document.getElementById("selection");
let topic = '';
let difficulty = '';
let optCont = document.getElementsByClassName('opt-cont')[0];
let cont = document.getElementById('instantQuizes');
let answers = [];
let actualQuestions = [];
let currentQuestion = 0;
let question = document.getElementById('question');
let qnumb = document.getElementById('qno');
let A = document.getElementById('A');
let B = document.getElementById('B');
let C = document.getElementById('C');
let D = document.getElementById('D');
let hint = document.getElementById('hint');
let quizzer = document.getElementById('Quizzer');
let topContainer = document.getElementById('topContainer');
let resuter = document.getElementById('resulter');
let stBtn = null;
let qno = 0
let timeCount = 0;
async function startQuiz() {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    try{
        let h1 = document.createElement('h1');
        stBtn.innerHTML = "Loading...";
        let h2 = document.createElement('h2');
        h2.innerHTML = "Your Quiz is being loaded, Please Do not Press any Key";
        h2.style.letterSpacing = '1.4px';
        h2.style.color = 'coral';
        h2.style.textAlign = 'center';
        stBtn.style.pointerEvents = "none";
        stBtn.style.opacity = "0.6";
        h1.innerHTML = "Preparing Your Quiz...";
        cont.appendChild(h1);
        cont.appendChild(h2);
        await new Promise(resolve => setTimeout(resolve,0));
        qno = 0;
        if(difficulty === 'EASY'){
            qno = 5;
            timeCount = 15;
        }else if(difficulty === "MODERATE"){
            qno = 10;
            timeCount = 20;
        }else{
            qno = 15;
            timeCount = 25;
        }
        let prompt = `Generate a quiz on the topic "${topic}" with difficulty level "${difficulty}".
Important rules (must follow strictly):
- Generate exactly ${qno} multiple-choice questions.
- Questions must be simple, natural, and easy to read.
- Questions should test understanding of ideas, meanings, purposes, and concepts.
- Do NOT mention words like "conceptual", "theory-based", or "definition-based" in the questions.
- Do NOT include any code snippets, code blocks, programming syntax, or symbols.
- Do NOT ask questions that require predicting output or analyzing code.
Question guidelines:
- Each question should contain only the plain text, no decoration should be used.
- Each option should also be a plain text.
- Each question must have exactly 4 options.
- Options must be plain text only (no labels like A, B, C, D).
- Include exactly one correct answer (must match one option exactly).
- Include one short hint per question.
- Hints must be subtle and helpful, but must NOT reveal the answer.
Difficulty levels:
- Easy: basic meanings and simple ideas
- Medium: understanding how and why things are used
- Hard: deeper understanding and reasoning (still no code)
Output rules:
- Do NOT include explanations.
- Return ONLY raw JSON.
- Do NOT use markdown, backticks, or extra text.
JSON format:
{
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Correct option text",
      "hint": "Short helpful hint"
    }
  ]
}`
        let respo = await fetch(API_URL, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                contents: [{
                    parts: [{text: prompt}],
                }]
            })
        });

        const data = await respo.json();
        if(!data.candidates || !data.candidates.length){
            throw new Error("No Response From Gemini")
        }

        const message = data.candidates[0].content.parts[0].text;
        let quizData = JSON.parse(message);
        let qz = quizData.quiz;
        actualQuestions = qz;
        for(let i = 0; i < qno; i++){
           answers.push(null); 
        }
        topContainer.style.display = 'none';
        quizzer.style.removeProperty('display');
        let headerLinks = document.querySelectorAll('.head-link');
        headerLinks.forEach(elem => {
            elem.innerHTML = '';
            elem.style.cursor = "default";
            elem.addEventListener('click',function(event){
                event.preventDefault();
            })
        })
        headerLinks[1].innerHTML = topic + ' Quiz ' + difficulty + ' Mode'; 
        currentQuestion = 0;
        showQuestion();
        
    }catch(error){
        console.log("Error: ",error)
    }
}
window.startQuiz = startQuiz;

function showQuestion(){
    let elems = document.querySelectorAll('.optio');
    elems.forEach((element) => {
        element.style.background = 'lightblue';
        element.style.color = 'black'
    });
    const rec = actualQuestions[currentQuestion];
    question.innerHTML = rec.question;
    qnumb.innerHTML = currentQuestion + 1;
    A.innerHTML = rec.options[0];
    B.innerHTML = rec.options[1];
    C.innerHTML = rec.options[2];
    D.innerHTML = rec.options[3];
    hint.innerHTML = "Hint";
    hint.onclick = () => {
        hint.innerHTML = rec.hint;
    };
    startTimer(timeCount);
}
window.showQuestion = showQuestion;

function nextQuestion(){
    currentQuestion++;
    if(currentQuestion < actualQuestions.length){
        showQuestion();
    }else{
        endQuiz();
        fetchResults();
    }
}
window.nextQuestion = nextQuestion;
function select(event){
    topic = event.target.innerHTML;
    let para = document.getElementById('para');
    para.innerHTML = "Choose a Difficulty";
    optCont.innerHTML = '';
    let easy = document.createElement('div');
    easy.innerHTML = "EASY";
    easy.id = 'easy';
    easy.className = 'opt';
    let moderate = document.createElement('div');
    moderate.innerHTML = "MODERATE";
    moderate.id = 'moderate';
    moderate.className = 'opt';
    let hard = document.createElement('div');
    hard.innerHTML = "HARD";
    hard.id = 'hard';
    hard.className = 'opt';
    hard.style.gridColumn = 'span 2';
    easy.onclick = setDifficulty;
    moderate.onclick = setDifficulty;
    hard.onclick = setDifficulty;
    optCont.appendChild(easy);
    optCont.appendChild(moderate);
    optCont.appendChild(hard);
    document.getElementsByClassName('new-comb')[0].remove();
    document.getElementById('srchTpc').remove();
}
window.select = select;

function setDifficulty(event){
    optCont.innerHTML = '';
    document.querySelector('.cont h1').innerHTML = topic + " Quiz";
    document.querySelector('.cont p').innerHTML = event.target.innerHTML + " Mode";
    difficulty = event.target.innerHTML;
    stBtn = document.createElement('div');
    stBtn.className = 'opt';
    stBtn.id = 'stBtn';
    stBtn.innerHTML = "Start Quiz";
    stBtn.style.gridColumn = 'span 2';
    stBtn.onclick = startQuiz;
    optCont.appendChild(stBtn);
}
window.setDifficulty = setDifficulty;

function startTimer(ment){
    let timer = document.getElementById('timer');
    timer.style.background = 'lightgreen';
    timer.style.color = 'black';
    timer.innerHTML = ment;
    let reference = setInterval(() => {
        timer.innerHTML = timer.innerHTML - 1;
        if(timer.innerHTML == 10){
            timer.style.background = 'orange';
        }else if(timer.innerHTML == 5){
            timer.style.background = 'red';
            timer.style.color = 'orange'
        }
        if(timer.innerHTML <= 0){
            clearInterval(reference);
            nextQuestion();
        }
    },1000)
}
window.startTimer = startTimer;

function clicked(event){
    let elems = document.querySelectorAll('.optio');
    elems.forEach((element) => {
        element.style.background = 'lightblue';
        element.style.color = 'black'
    });
    event.target.style.background = 'blue';
    event.target.style.color = 'lightblue';
    answers[currentQuestion] = event.target.innerHTML;
}
window.clicked = clicked;
function endQuiz(){
    let quizzer = document.getElementsByClassName('quizzer')[0];
    quizzer.innerHTML = '';
}
window.endQuiz = endQuiz;
function fetchResults(){
    let score = 0;
    let ign = 0;
    for(let i = 0; i < answers.length; i++){
        if(actualQuestions[i].answer === answers[i]){
            score++;
        }else if(answers[i] == null){
            ign++;
        }
    }
    quizzer.style.display = 'none';
    resuter.style.removeProperty('display');
    let correctNo = document.getElementById('correctNo');
    correctNo.innerHTML = score;
    let gnQs = document.getElementById('gnQs');
    gnQs.innerHTML = qno;
    let wrongNO = document.getElementById('wrongNo');
    wrongNO.innerHTML = qno - score - ign;
    let ignored = document.getElementById('ignored');
    ignored.innerHTML = ign;
    let scored = document.getElementById('scored');
    scored.innerHTML = score + '/' + qno;
}
window.fetchResults = fetchResults;
function displaySolution(){
    resuter.style.display = 'none';
    let ansCont = document.getElementById('ansCont');
    ansCont.style.removeProperty('display');
    ansCont.innerHTML = "";
    let hd1 = document.createElement('h1');
    hd1.innerHTML = "Quiz Solutions";
    ansCont.appendChild(hd1);
    for(let i=0; i<answers.length; i++){
        let QComb = document.createElement('div');
        QComb.id = "QComb"
        let Qnumber = document.createElement('div');
        Qnumber.id = "Qnumber"
        Qnumber.innerHTML = i + 1;
        QComb.appendChild(Qnumber);
        let Aquestion = document.createElement('div');
        Aquestion.id = "Aquestion";
        Aquestion.innerHTML = actualQuestions[i].question;
        QComb.appendChild(Aquestion);
        let Aanswer = document.createElement('div');
        Aanswer.id = "Aanswer";
        let AA = document.createElement('div');
        AA.id = "AA";
        AA.innerHTML = actualQuestions[i].options[0];
        Aanswer.appendChild(AA);
        let AB = document.createElement('div');
        AB.id = "AB";
        AB.innerHTML = actualQuestions[i].options[1];
        Aanswer.appendChild(AB)
        let AC = document.createElement('div');
        AC.id = "AC";
        AC.innerHTML = actualQuestions[i].options[2];
        Aanswer.appendChild(AC);
        let AD = document.createElement('div');
        AD.id = "AD";
        AD.innerHTML = actualQuestions[i].options[3];
        Aanswer.appendChild(AD);

        // Map option text to option elements
        const optionMap = {
        [actualQuestions[i].options[0]]: AA,
        [actualQuestions[i].options[1]]: AB,
        [actualQuestions[i].options[2]]: AC,
        [actualQuestions[i].options[3]]: AD
        };

        let correctAnswer = actualQuestions[i].answer;
        let userAnswer = answers[i];
        let Result = "";

        // CASE 1: User did not select anything
        if (userAnswer === null) {
            optionMap[correctAnswer].style.background = "lightgreen";
            optionMap[correctAnswer].style.color = "darkgreen";
            optionMap[correctAnswer].style.border = "1px solid darkgreen";
            Result = "Not Attempted";
        }

        // CASE 2: User selected correct answer
        else if (userAnswer === correctAnswer) {
            optionMap[userAnswer].style.background = "lightgreen";
            optionMap[userAnswer].style.color = "darkgreen";
            optionMap[userAnswer].style.border = "1px solid darkgreen";
            Result = "Correct";
        }

        // CASE 3: User selected wrong answer
        else {
            // Highlight selected wrong answer
            optionMap[userAnswer].style.background = "orange";
            optionMap[userAnswer].style.color = "red";
            optionMap[userAnswer].style.border = "1px solid red";

            // Highlight correct answer
            optionMap[correctAnswer].style.background = "lightgreen";
            optionMap[correctAnswer].style.color = "darkgreen";
            optionMap[correctAnswer].style.border = "1px solid darkgreen";

            Result = "Wrong";
        }
        if(Result == 'Not Attempted'){
            Qnumber.style.background = 'aqua';
            Qnumber.style.color = 'black';
        }else if(Result == "Correct"){
            Qnumber.style.background = 'lightgreen';
            Qnumber.style.color = 'darkgreen';
        }else if(Result = "Wrong"){
            Qnumber.style.background = 'orange';
            Qnumber.style.color = 'red';
        }
        ansCont.appendChild(QComb);
        ansCont.appendChild(Aanswer);
    }
    let expBtn = document.createElement('div');
        expBtn.className = "explore-btn";
        expBtn.innerHTML = "Exit";
        expBtn.onclick = () => {
            window.location.href = 'instant-quizes.html';
        }
        ansCont.appendChild(expBtn);
}
window.displaySolution = displaySolution;

function redirect(){
    window.location.href = 'instant-quizes.html';
}
window.redirect = redirect;

async function searchTopic(event){
    let searchBox = document.getElementById('customTopic');
    if(searchBox.value.trim() === ''){
        alert("Enter a Valid Prompt to Search Topic !");
        return;
    }
    event.target.innerHTML = "Searching...";
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    let prompt = `You are a topic validator.
Given a user input, decide whether it represents a valid quiz topic that can be used to generate educational quiz questions.
Rules:
- If the input refers to a valid learning topic (programming language, technology, subject, skill, or academic area), extract and return a clean, concise topic name.
- Normalize the topic to its commonly accepted short form (example: "I need to learn c++" → "C++").
- If the input is meaningless, random, offensive, or not suitable as a quiz topic, mark it as invalid.
- Do NOT explain your reasoning.
- Return ONLY raw JSON.
- Do NOT use markdown or extra text.
JSON format:
{
  "valid": true or false,
  "topic": "Normalized topic name or null"
}
User input:"${searchBox.value}"`;
    let respo = await fetch(API_URL, {
        method: 'POST',
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
            contents: [{
                parts: [{text: prompt}],
            }]
        })
    });

    const data = await respo.json();
    if(!data.candidates || !data.candidates.length){
        throw new Error("No Response From Gemini")
    }

    const message = data.candidates[0].content.parts[0].text;
    let quizTopic = JSON.parse(message);
    if(!quizTopic.valid){
        alert("No Topic Found !");
        event.target.innerHTML = "Search";
        return;
    }
    document.getElementById('para').innerHTML = "We found New Topic based on Your Search ! <br> Here are them..."
    let optCont = document.getElementsByClassName('opt-cont')[0]
    optCont.innerHTML = "";
    let newTopic = document.createElement('div');
    newTopic.id = quizTopic.topic;
    newTopic.innerHTML = quizTopic.topic;
    newTopic.className = 'opt';
    newTopic.onclick = select;
    newTopic.style.gridColumn = "span 2";
    optCont.appendChild(newTopic);
    event.target.innerHTML = "Search Again";
    searchBox.value = "";
}
window.searchTopic = searchTopic;