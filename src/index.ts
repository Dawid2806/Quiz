const progress = document.querySelector("#progress") as HTMLElement;
const countDownInfo = document.querySelector("#count-down");
const questionHeading = document.getElementById("question-heading");

const answersList = document.querySelector("#answers-list");
const summary = document.querySelector(".summary");
const submitButton = document.querySelector(
  "#submit-answer"
) as HTMLButtonElement;
const restartButton = document.querySelector(
  "#restart-quiz"
) as HTMLButtonElement;

let currentQuestionIndex = -1;
let countDownInterval;

let userSelectedIndex;
const getData = async <Response>() => {
  const serverData = await fetch("questions.json");
  const jsonData = await serverData.json();

  if (!jsonData.questions) {
    console.log("Brak pytań");
    return;
  }
  const quizMaxTime = jsonData.quizMaxTime * 1000;
  const questions = jsonData.questions;
  return { quizMaxTime, questions };
};

const submitAnswer = async () => {
  const data = await getData();
  const questions = data.questions;
  let userSelectedInput = document.querySelector(
    'input[type="radio"]:checked'
  ) as HTMLInputElement;

  userSelectedIndex = userSelectedInput.getAttribute("data-index");
  const question = questions[currentQuestionIndex];
  question.userSelectedIndex = userSelectedIndex;

  if (userSelectedInput) {
    nextQuestionData();
  }
};

const restartQuiz = async () => {
  const data = await getData();
  data.questions.forEach((quest) => (quest.userSelectedIndex = -1));
  currentQuestionIndex = -1;
  nextQuestionData();
  countDown();
  answersList.classList.remove("hide");
  submitButton.classList.remove("hide");
  restartButton.classList.remove("show");
  summary.classList.add("hide");
};

const countDown = async () => {
  const data = await getData();
  const maxTime = data.quizMaxTime;
  if (!countDownInterval) {
    const quizStartTime = new Date().getTime();
    const quizEndTime = quizStartTime + maxTime;

    countDownInterval = setInterval(() => {
      const currentTime = new Date().getTime();
      if (currentTime >= quizEndTime) {
        stopCountDown();
        showSummary();
        return;
      }
      let timeLeft = Math.floor((quizEndTime - currentTime) / 1000);
      countDownInfo.textContent = "Pozostało:" + timeLeft + "sek";
    }, 1000);
  }
};
const stopCountDown = () => {
  clearInterval(countDownInterval);
  countDownInterval = null;
  countDownInfo.textContent = "";
};

const nextQuestionData = async () => {
  const data = await getData();
  const questions = data.questions;
  currentQuestionIndex++;

  if (currentQuestionIndex >= questions.length) {
    showSummary();
    return;
  }
  const question = questions[currentQuestionIndex];
  questionHeading.innerHTML = question.q;
  const progressInfo = `Pytanie ${currentQuestionIndex + 1} z ${
    questions.length
  }`;
  progress.innerHTML = progressInfo;
  const answersHtml = question.answers
    .map((answerText, index) => {
      const answerId = "answer" + index;
      return `<li>
      <input type ='radio' name='answer' id='${answerId}'
      data-index="${index}" class="answer"
      <label for="${answerId}">${answerText}</label>
    </li>`;
    })
    .join("");
  answersList.innerHTML = answersHtml;
};

const showSummary = async () => {
  const data = await getData();
  const questions = data.questions;
  stopCountDown();
  answersList.classList.add("hide");
  submitButton.classList.add("hide");
  restartButton.classList.add("show");
  summary.classList.remove("hide");

  questionHeading.innerHTML = "Podsumowanie wyników";

  let numCorrectAnswers = 0;
  let summaryHtlm = questions

    .map((question, questionIndex) => {
      const answerId = "answer" + questionIndex;
      const answersHtml = question.answers
        .map((answerText, answerIndex) => {
          let classToAdd = "";
          let checkedAttr = "";
          console.log(question.correctAnswerNum == question.userSelectedIndex);
          if (userSelectedIndex !== undefined) {
            if (
              question.correctAnswerNum == question.userSelectedIndex &&
              answerIndex == question.correctAnswerNum
            ) {
              classToAdd = "correct-answer";
              checkedAttr = "checked";
              numCorrectAnswers++;
            }
            if (
              question.userSelectedIndex != question.correctAnswerNum &&
              answerIndex == question.userSelectedIndex
            ) {
              classToAdd = "wrong-answer";
              checkedAttr = "checked";
            }
          }
          return `
            <li class="${classToAdd}">
            <input ${checkedAttr} disabled type='radio' name="answer" id="${answerId}" data-index="" class="answer" >
            <label for${answerId}>${answerText}</label>
            </li>
          `;
        })
        .join("");
      return `
        <h4>Pytanie nr.${questionIndex}: ${question.q}
        <ul>${answersHtml}</ul>
      `;
    })
    .join("");

  summaryHtlm += `
    <hr>
      <h3>Ilość prawidłowych odpowiedzi: ${numCorrectAnswers}, na ${questions.length}</h3>

    `;
  summary.innerHTML = summaryHtlm;
};
const app = () => {
  nextQuestionData();
};

submitButton.addEventListener("click", submitAnswer);
restartButton.addEventListener("click", restartQuiz);
window.onload = () => {
  app();
};
