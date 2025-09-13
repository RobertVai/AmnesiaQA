import React from "react";
import dayjs from "dayjs";
import styles from "@/pages/Questions/questions.module.css";
import { Question, Answer } from "@/types/interfaces";
import AnswerCard from "../AnswerCard/answercard";
import VotingButtons from "../VotingButtons/votingbuttons";

type Props = {
  q: Question & {
    answers: Answer[];
    answersCount: number;
    showAnswers: boolean;
  };
  userId: string;
  isAuth: boolean;
  answerInputs: Record<string, string>;

  onLike: (id: string) => void;
  onDislike: (id: string) => void;
  onToggleAnswers: (id: string) => void;
  onDeleteQuestion: (id: string) => void;
  onAnswerLike: (aId: string, qId: string) => void;
  onAnswerDislike: (aId: string, qId: string) => void;
  onDeleteAnswer: (aId: string, qId: string) => void;
  onAnswerChange: (id: string, v: string) => void;
  onSubmitAnswer: (id: string) => void;
};

export default function QuestionCard({
  q,
  userId,
  isAuth,
  answerInputs,
  onLike,
  onDislike,
  onToggleAnswers,
  onDeleteQuestion,
  onAnswerLike,
  onAnswerDislike,
  onDeleteAnswer,
  onAnswerChange,
  onSubmitAnswer,
}: Props) {
  return (
    <div className={styles.card} key={q._id}>
      <p className={styles.question}>{q.questionText}</p>

      <div className={styles.meta}>
        <span>{q.userName}</span>
        <span>{dayjs(q.date).format("YYYY-MM-DD HH:mm")}</span>
        <span>
          <VotingButtons
            likes={q.likes}
            dislikes={q.dislikes}
            userVote={q.liked ? "like" : q.disliked ? "dislike" : undefined}
            onLike={() => onLike(q._id)}
            onDislike={() => onDislike(q._id)}
          />
        </span>
        {userId === q.user_id && (
          <button
            onClick={() => onDeleteQuestion(q._id)}
            className={styles.deleteBtn}
          >
            🗑️ Delete
          </button>
        )}
        <button
          onClick={() => onToggleAnswers(q._id)}
          className={styles.toggleBtn}
        >
          {q.showAnswers ? "Hide" : "Show"} Answers ({q.answersCount})
        </button>
      </div>

      {q.showAnswers && (
        <div className={styles.answersBlock}>
          {q.answers.map((a) => (
            <AnswerCard
              key={a._id}
              a={a}
              qId={q._id}
              userId={userId}
              onAnswerLike={onAnswerLike}
              onAnswerDislike={onAnswerDislike}
              onDeleteAnswer={onDeleteAnswer}
            />
          ))}

          {isAuth && (
            <div className={styles.form}>
              <textarea
                placeholder="Write your answer..."
                value={answerInputs[q._id] || ""}
                onChange={(e) => onAnswerChange(q._id, e.target.value)}
                rows={3}
                className={styles.input}
              />
              <button
                onClick={() => onSubmitAnswer(q._id)}
                className={styles.btn}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
