const progress = document.querySelector("#progress") as HTMLElement;
const countDownInfo = document.querySelector("#count-down") as HTMLElement;
const questionHeading = document.getElementById(
  "question-heading"
) as HTMLElement;

const answersList = document.querySelector("#answers-list") as HTMLElement;
const summary = document.querySelector(".summary") as HTMLElement;
const submitButton = document.querySelector(
  "#submit-answer"
) as HTMLButtonElement;
const restartButton = document.querySelector(
  "#restart-quiz"
) as HTMLButtonElement;

let currentQuestionIndex = -1;
let countDownInterval: any;

const selectedAnswers: string[] = [];

const getData = async () => {
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
  const questions = data?.questions;
  let userSelectedInput = document.querySelector(
    'input[type="radio"]:checked'
  ) as HTMLInputElement;
  selectedAnswers.push(userSelectedInput.getAttribute("data-index") as string);
  console.log(userSelectedInput.getAttribute("data-index"));

  if (userSelectedInput) {
    nextQuestionData();
  }
};

const restartQuiz = async () => {
  const data = await getData();

  if (!data?.questions) return;
  const { questions } = data;
  questions.forEach((quest: questions) => (quest.userSelectedIndex = -1));
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
  if (!data?.quizMaxTime) return;
  const { quizMaxTime } = data;
  const maxTime: number = quizMaxTime;

  if (!countDownInterval) {
    const quizStartTime = new Date().getTime();
    const quizEndTime: number = quizStartTime + maxTime;

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
countDown();
const stopCountDown = (): void => {
  clearInterval(countDownInterval);
  countDownInterval = null;
  countDownInfo.textContent = "";
};

const nextQuestionData = async () => {
  const data = await getData();
  const questions = data?.questions;
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
    .map((answerText: string, index: number) => {
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
  const questions = data?.questions;
  stopCountDown();
  answersList.classList.add("hide");
  submitButton.classList.add("hide");
  restartButton.classList.add("show");
  summary.classList.remove("hide");

  questionHeading.innerHTML = "Podsumowanie wyników";

  let numCorrectAnswers = 0;
  const answeredQuestion = questions
    .map((question: questions, index: number) => {
      console.log(question);
      const correctAnswer = question.answers[question.correctAnswerNum];
      const selectedAnswerByUserIndex = selectedAnswers[index];
      const isSelectedAnswerCorrect =
        Number(question.correctAnswerNum) === Number(selectedAnswerByUserIndex);
      console.log(
        selectedAnswerByUserIndex,
        question.correctAnswerNum,
        isSelectedAnswerCorrect
      );

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
};
const app = () => {
  nextQuestionData();
};

submitButton.addEventListener("click", submitAnswer);
restartButton.addEventListener("click", restartQuiz);
window.onload = () => {
  app();
};

type Questions = [questions];

type questions = {
  quizMaxTime: number;
  questions: string[];
  q: string;
  answers: string[];
  correctAnswerNum: number;
  userSelectedIndex: number;
};
