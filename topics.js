function redir(path){
    window.location.href = path; 
}
window.redir = redir;

function displayDifficulty(){
    let contLinks = document.querySelector('.cont-links');
    let cont = document.querySelector('.cont');
    let easy = document.createElement('div');
    easy.className = 'btn';
    easy.innerHTML = "Beginner";
    let medium = document.createElement('div');
    medium.className = 'btn';
    medium.innerHTML = "Intermediate";
    let hard = document.createElement('div');
    hard.className = 'btn';
    hard.innerHTML = "Advanced";
    contLinks.innerHTML = '';
    easy.onclick= (event) => {
        selectDifficulty(event);
    }
    medium.onclick= (event) => {
        selectDifficulty(event);
    }
    hard.onclick= (event) => {
        selectDifficulty(event);
    }
    contLinks.appendChild(easy);
    contLinks.appendChild(medium);
    contLinks.appendChild(hard);    
    cont.querySelector('h1').innerHTML = "Select Difficulty";
    cont.querySelector('h3').innerHTML = "Choose your skill level to start learning.";
}
window.displayDifficulty = displayDifficulty;

function selectDifficulty(event){
    localStorage.setItem('difficulty', event.target.innerHTML);
    redir('quiz-starter.html');
}