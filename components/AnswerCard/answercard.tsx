import React from "react";
import dayjs from "dayjs";
import styles from "@/pages/Questions/questions.module.css";
import VotingButtons from "../VotingButtons/votingbuttons";
import { Answer } from "@/types/interfaces";

type Props = {
  a: Answer;
  qId: string;
  userId: string;
  onAnswerLike: (answerId: string, questionId: string) => void;
  onAnswerDislike: (answerId: string, questionId: string) => void;
  onDeleteAnswer: (answerId: string, questionId: string) => void;
};

export default function AnswerCard({
  a,
  qId,
  userId,
  onAnswerLike,
  onAnswerDislike,
  onDeleteAnswer,
}: Props) {
  return (
    <div className={styles.answer}>
      <p>{a.text}</p>
      <span>
        {a.user_name} • {dayjs(a.date).format("YYYY-MM-DD HH:mm")}
      </span>

      <div className={styles.meta}>
        <VotingButtons
          likes={a.likes}
          dislikes={a.dislikes}
          userVote={a.liked ? "like" : a.disliked ? "dislike" : undefined}
          onLike={() => onAnswerLike(a._id, qId)}
          onDislike={() => onAnswerDislike(a._id, qId)}
        />
        {userId === a.user_id && (
          <button
            className={styles.deleteBtn}
            onClick={() => onDeleteAnswer(a._id, qId)}
          >
            🗑️ Delete
          </button>
        )}
      </div>
    </div>
  );
}
