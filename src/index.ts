const getProgressElement = (): HTMLDivElement | null =>
  document.querySelector("#progress");
const countDownInfo = document.querySelector("#count-down") as HTMLElement;
const questionHeading = document.querySelector(
  "#question-heading"
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

const selectedAnswers: string[] = [];
let questionsState: QuestionsJSON | undefined = undefined;

const getData = async (): Promise<QuestionsJSON | undefined> => {
  const serverData = await fetch("questions.json");
  const jsonData: QuestionsJSON = await serverData.json();

  if (!jsonData.questions) {
    console.log("Brak pytań");
    return;
  }
  const quizMaxTime = jsonData.quizMaxTime * 1000;
  const questions = jsonData.questions.map((question) => ({
    ...question,
    userSelectedIndex: -1,
  }));
  return { quizMaxTime, questions };
};

const submitAnswer = async (interval: number) => {
  const userSelectedInput = document.querySelector(
    'input[type="radio"]:checked'
  ) as HTMLInputElement;
  selectedAnswers.push(userSelectedInput.getAttribute("data-index") as string);
  console.log(userSelectedInput.getAttribute("data-index"));

  if (userSelectedInput) {
    nextQuestionData(interval);
  }
};

const restartQuiz = (interval: number) => {
  if (!questionsState?.questions) return;
  const { questions } = questionsState;
  questions.forEach((quest) => (quest.userSelectedIndex = -1));
  currentQuestionIndex = -1;
  nextQuestionData(interval);
  stopCountDown(interval);
  answersList.classList.remove("hide");
  submitButton.classList.remove("hide");
  restartButton.classList.remove("show");
  summary.classList.add("hide");
};

const getCountDownInterval = () => {
  if (!questionsState?.quizMaxTime) return;
  const { quizMaxTime } = questionsState;
  const maxTime = quizMaxTime;

  const quizStartTime = new Date().getTime();
  const quizEndTime: number = quizStartTime + maxTime;

  const interval = setInterval(() => {
    const currentTime = new Date().getTime();
    if (currentTime >= quizEndTime) {
      stopCountDown(interval);
      showSummary(interval);
      return;
    }
    let timeLeft = Math.floor((quizEndTime - currentTime) / 1000);
    countDownInfo.textContent = "Pozostało:" + timeLeft + "sek";
  }, 1000);
  return interval;
};

const stopCountDown = (intervalId: number) => {
  clearInterval(intervalId);
  countDownInfo.textContent = "";
};

const nextQuestionData = async (intervalId: number) => {
  const questions = questionsState?.questions;
  if (!questions) return;
  const progress = getProgressElement();
  currentQuestionIndex++;

  if (currentQuestionIndex >= questions.length) {
    showSummary(intervalId);
    return;
  }
  const question = questions[currentQuestionIndex];
  questionHeading.innerHTML = question.q;
  const progressInfo = `Pytanie ${currentQuestionIndex + 1} z ${
    questions.length
  }`;
  if (!progress) return;
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

const showSummary = async (intervalId: number) => {
  const questions = questionsState?.questions;
  if (!questions) return;
  stopCountDown(intervalId);
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
  <hr />
    <h3>Ilość prawidłowych odpowiedzi: ${numCorrectAnswers}, na ${questions.length}</h3>
  `;
  summary.innerHTML = `${answeredQuestion} ${numberOfCorrectAnswersHTML}`;
};
const app = async () => {
  const interval = getCountDownInterval();
  if (!interval) return;
  questionsState = await getData();
  nextQuestionData(interval);

  submitButton.addEventListener("click", () => submitAnswer(interval));
  restartButton.addEventListener("click", () => restartQuiz(interval));
};

window.onload = () => {
  void app();
};

type Questions = [questions];

type questions = {
  quizMaxTime: number;
  questions: Question[];
  q: string;
  answers: string[];
  correctAnswerNum: number;
  userSelectedIndex: number;
};

type QuestionsJSON = {
  quizMaxTime: number;
  questions: Question[];
};

type Question = {
  q: string;
  answers: string[];
  correctAnswerNum: number;
  userSelectedIndex: number;
};
