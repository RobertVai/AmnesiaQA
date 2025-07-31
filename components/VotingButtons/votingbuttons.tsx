import React from "react";
import Image from "next/image";
import styles from "@/pages/Questions/questions.module.css";

type Props = {
  likes: number;
  dislikes: number;
  userVote?: "like" | "dislike";
  onLike: () => void;
  onDislike: () => void;
};

export default function VotingButtons({ likes, dislikes, userVote, onLike, onDislike }: Props) {
  return (
    <span>
      <button
        onClick={onLike}
        className={`${styles.likeBtn} ${userVote === "like" ? styles.liked : ""}`}
      >
        <Image src="/icons/heart.png" alt="Like" width={20} height={20} />
        {likes}
      </button>
      <button
        onClick={onDislike}
        className={`${styles.likeBtn} ${userVote === "dislike" ? styles.liked : ""}`}
        style={{ marginLeft: 12 }}
      >
        <Image src="/icons/broken-heart.png" alt="Dislike" width={20} height={20} />
        {dislikes}
      </button>
    </span>
  );
}
