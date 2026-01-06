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
let prevBtn = document.getElementById("prevBtn");
let nextBtn = document.getElementById("nextBtn");
let submitBtn = document.getElementById("submitBtn");
startQuiz()
async function startQuiz() {
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
    try{
        await new Promise(resolve => setTimeout(resolve,0));
        qno = 5;
        timeCount = 10;
        let prompt = `You are an AI learning evaluator.
Your task is to generate learning-oriented quiz questions that assess conceptual understanding in Python, grounded in real Python usage.
Context:
- Programming Language: Python
- Learner Level: ${localStorage.getItem('difficulty')}
CRITICAL RULES (MUST FOLLOW):
- Every question MUST explicitly reference Python
- Questions must mention Python concepts such as:
  - built-in data types (list, tuple, dict, set)
  - Python properties (mutability, immutability)
  - Python behavior (how Python handles data)
- Do NOT ask generic computer science questions
- Do NOT use abstract wording that could apply to any language
STRICT CONTENT RULES:
- Do NOT include any code snippets
- Do NOT include programming syntax
- Questions must be completely text-based
- Do NOT include markdown or formatting
- Stay strictly within the learner’s level
Question Design Rules:
- Use only:
  - Conceptual MCQs grounded in Python
  - Reverse MCQs based on Python behavior
  - Theory-based understanding checks specific to Python
- Avoid definition-only questions
- Avoid generic theory questions
Output Requirements:
- Generate EXACTLY 5 questions
- Each question must have EXACTLY 4 options
- Clearly specify the correct option text
- Provide a short, helpful hint that references Python reasoning
Return the response strictly in the following JSON format and nothing else:
{
  "quiz": [
    {
      "question": "Question text",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Correct option text",
      "hint": "Short helpful hint"
    }
  ]
}`;
        document.querySelector('header').style.display = 'none';
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
        currentQuestion = 0;
        showQuestion();
        
    }catch(error){
        console.log("Error: ",error)
    }
}
window.startQuiz = startQuiz;

function showQuestion() {
    // Reset option styles
    let elems = document.querySelectorAll('.optio');
    elems.forEach((element) => {
        element.style.background = 'lightblue';
        element.style.color = 'black';
    });

    const rec = actualQuestions[currentQuestion];

    question.innerHTML = rec.question;
    qnumb.innerHTML = currentQuestion + 1;

    A.innerHTML = rec.options[0];
    B.innerHTML = rec.options[1];
    C.innerHTML = rec.options[2];
    D.innerHTML = rec.options[3];

    // Restore previously selected answer
    if (answers[currentQuestion]) {
        elems.forEach(opt => {
            if (opt.innerHTML === answers[currentQuestion]) {
                opt.style.background = 'blue';
                opt.style.color = 'lightblue';
            }
        });
    }

    // Hint
    hint.innerHTML = "Hint";
    hint.onclick = () => {
        hint.innerHTML = rec.hint;
    };

    // Button visibility logic
    prevBtn.style.display = currentQuestion === 0 ? "none" : "inline-block";

    if (currentQuestion === actualQuestions.length - 1) {
        nextBtn.style.display = "none";
        submitBtn.style.display = "inline-block";
    } else {
        nextBtn.style.display = "inline-block";
        submitBtn.style.display = "none";
    }
}

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
    document.querySelector('header').style.display = 'grid';
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
            window.location.href = 'topics.html';
        }
        ansCont.appendChild(expBtn);
}
window.displaySolution = displaySolution;

function redirect(){
    window.location.href = 'instant-quizes.html';
}
window.redirect = redirect;

function submitQuiz() {
    endQuiz();
    fetchResults();
}
window.submitQuiz = submitQuiz;

function nextQuestion() {
    if (currentQuestion < actualQuestions.length - 1) {
        currentQuestion++;
        showQuestion();
    }
}
window.nextQuestion = nextQuestion;

function prevQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}
window.prevQuestion = prevQuestion;


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