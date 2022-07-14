"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const progress = document.querySelector("#progress");
const countDownInfo = document.querySelector("#count-down");
const questionHeading = document.getElementById("question-heading");
const answersList = document.querySelector("#answers-list");
const summary = document.querySelector(".summary");
const submitButton = document.querySelector("#submit-answer");
const restartButton = document.querySelector("#restart-quiz");
let currentQuestionIndex = -1;
let countDownInterval;
const selectedAnswers = [];
const getData = () => __awaiter(void 0, void 0, void 0, function* () {
    const serverData = yield fetch("questions.json");
    const jsonData = yield serverData.json();
    if (!jsonData.questions) {
        console.log("Brak pytań");
        return;
    }
    const quizMaxTime = jsonData.quizMaxTime * 1000;
    const questions = jsonData.questions;
    return { quizMaxTime, questions };
});
const submitAnswer = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield getData();
    const questions = data === null || data === void 0 ? void 0 : data.questions;
    let userSelectedInput = document.querySelector('input[type="radio"]:checked');
    selectedAnswers.push(userSelectedInput.getAttribute("data-index"));
    console.log(userSelectedInput.getAttribute("data-index"));
    if (userSelectedInput) {
        nextQuestionData();
    }
});
const restartQuiz = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield getData();
    if (!(data === null || data === void 0 ? void 0 : data.questions))
        return;
    const { questions } = data;
    questions.forEach((quest) => (quest.userSelectedIndex = -1));
    currentQuestionIndex = -1;
    nextQuestionData();
    countDown();
    answersList.classList.remove("hide");
    submitButton.classList.remove("hide");
    restartButton.classList.remove("show");
    summary.classList.add("hide");
});
const countDown = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield getData();
    if (!(data === null || data === void 0 ? void 0 : data.quizMaxTime))
        return;
    const { quizMaxTime } = data;
    const maxTime = quizMaxTime;
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
});
countDown();
const stopCountDown = () => {
    clearInterval(countDownInterval);
    countDownInterval = null;
    countDownInfo.textContent = "";
};
const nextQuestionData = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield getData();
    const questions = data === null || data === void 0 ? void 0 : data.questions;
    currentQuestionIndex++;
    if (currentQuestionIndex >= questions.length) {
        showSummary();
        return;
    }
    const question = questions[currentQuestionIndex];
    questionHeading.innerHTML = question.q;
    const progressInfo = `Pytanie ${currentQuestionIndex + 1} z ${questions.length}`;
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
});
const showSummary = () => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield getData();
    const questions = data === null || data === void 0 ? void 0 : data.questions;
    stopCountDown();
    answersList.classList.add("hide");
    submitButton.classList.add("hide");
    restartButton.classList.add("show");
    summary.classList.remove("hide");
    questionHeading.innerHTML = "Podsumowanie wyników";
    let numCorrectAnswers = 0;
    const answeredQuestion = questions
        .map((question, index) => {
        console.log(question);
        const correctAnswer = question.answers[question.correctAnswerNum];
        const selectedAnswerByUserIndex = selectedAnswers[index];
        const isSelectedAnswerCorrect = Number(question.correctAnswerNum) === Number(selectedAnswerByUserIndex);
        console.log(selectedAnswerByUserIndex, question.correctAnswerNum, isSelectedAnswerCorrect);
        if (!isSelectedAnswerCorrect) {
            return `
          <li class="wrong-answer">Odpowiedziałeś źle. Poprawną odpowiedzią jest ${correctAnswer}
          </li>`;
        }
        numCorrectAnswers++;
        return `<li class='correct-answer' >Poprawna odpowiedź!</li>`;
    })
        .join("");
    const numberOfCorrectAnswersHTML = `
  <hr>
    <h3>Ilość prawidłowych odpowiedzi: ${numCorrectAnswers}, na ${questions.length}</h3>
  `;
    summary.innerHTML = `${answeredQuestion} ${numberOfCorrectAnswersHTML}`;
});
const app = () => {
    nextQuestionData();
};
submitButton.addEventListener("click", submitAnswer);
restartButton.addEventListener("click", restartQuiz);
window.onload = () => {
    app();
};
