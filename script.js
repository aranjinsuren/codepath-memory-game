// Global constants
const cluePauseTime = 333; // how long to pause in between clues
const nextClueWaitTime = 1000; // how long to wait before starting playback of the clue sequence

// Global Variables
var pattern = new Array();
var progress = 0;
var wrongAttempts = 0;
var strikes = 3;
var gamePlaying = false;
var tonePlaying = false;
var volume = 0.5; // must be between 0.0 and 1.0
var guessCounter = 0;
var clueHoldTime = 1000; // how long to hold each clue's light/sound
var numberOfButtons = 5; // used for randomizing, easily to be changed in the variable if number of buttons are added

function startGame(){
  pattern = new Array();
  randomPattern(); // the pattern of the game is randomized every time a new game is played
  progress = 0;
  wrongAttempts = 0;
  clueHoldTime = 1000;
  gamePlaying = true;
  document.getElementById("startBtn").classList.add("hidden");
  document.getElementById("stopBtn").classList.remove("hidden");
  playClueSequence();
}

function stopGame(){
  gamePlaying = false;
  document.getElementById("startBtn").classList.remove("hidden");
  document.getElementById("stopBtn").classList.add("hidden");
}

// Returns a random number between min and max inclusive
function randomInteger(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// randomizes the pattern of the game every time it is played
function randomPattern(){
  for (let i=0; i<8; i++){
    pattern.push(randomInteger(1,numberOfButtons));
  }
}

// Sound Synthesis Functions
const freqMap = {
  1: 261.6, // C note
  2: 293.6, // D note
  3: 329.6, // E note
  4: 349.2, // F note
  5: 392.0  // G note
}
function playTone(btn,len){ 
  o.frequency.value = freqMap[btn]
  g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
  context.resume()
  tonePlaying = true
  setTimeout(function(){
    stopTone()
  },len)
}
function startTone(btn){
  if(!tonePlaying){
    context.resume()
    o.frequency.value = freqMap[btn]
    g.gain.setTargetAtTime(volume,context.currentTime + 0.05,0.025)
    context.resume()
    tonePlaying = true
  }
}
function stopTone(){
  g.gain.setTargetAtTime(0,context.currentTime + 0.05,0.025)
  tonePlaying = false
}

function lightButton(btn){
  document.getElementById("button"+btn).classList.add("lit")
}

function clearButton(btn){
  document.getElementById("button"+btn).classList.remove("lit")
}

function playSingleClue(btn){
  if(gamePlaying){
    lightButton(btn);
    playTone(btn,clueHoldTime);
    setTimeout(clearButton,clueHoldTime,btn);
  }
}

function playClueSequence(){
  guessCounter = 0;
  clueHoldTime -= 75;
  let delay = nextClueWaitTime; // set delay to initial wait time
  for(let i=0;i<=progress;i++){ // for each clue that is revealed so far
    console.log("play single clue: " + pattern[i] + " in " + delay + "ms")
    setTimeout(playSingleClue,delay,pattern[i]) // set a timeout to play that clue
    delay += clueHoldTime 
    delay += cluePauseTime;
  }
}

function guess(btn){
  console.log("user guessed: " + btn);
  if(!gamePlaying){
    return;
  }
  if (pattern[guessCounter] == btn){
    if (guessCounter == progress){
      if (progress == pattern.length - 1){
        winGame();
      } else {
        progress++;
        playClueSequence();
      }
    } else {
      guessCounter++;
    }
  } else {
    wrongAttempts++;
    if (wrongAttempts == strikes) {
      lostGame();
    } else {
      playClueSequence();
    }
  } 
}

function lostGame(){
  stopGame();
  alert("Game Over. You lost. Better luck next time!");
}

function winGame(){
  stopGame();
  alert("Game Over. You Won! Good job.");
}

// Page Initialization
// Init Sound Synthesizer
var AudioContext = window.AudioContext || window.webkitAudioContext 
var context = new AudioContext()
var o = context.createOscillator()
var g = context.createGain()
g.connect(context.destination)
g.gain.setValueAtTime(0,context.currentTime)
o.connect(g)
o.start(0)