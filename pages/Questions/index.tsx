import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Sidebar from "@/components/Sidebar/Sidebar";
import styles from "./questions.module.css";
import { Question } from "@/types/interfaces";
import { useUser } from "@/contexts/UserContext";
import dayjs from "dayjs";
import api from "@/utils/api";
import Image from "next/image";

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAuth, setIsAuth] = useState(false);
  const [answerInputs, setAnswerInputs] = useState<{ [key: string]: string }>({});
  const [filter, setFilter] = useState<"all" | "answered" | "unanswered">("all");
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/");
    } else {
      setIsAuth(true);
      fetchQuestions();
    }
  }, [user, loading]);

  const fetchQuestions = async () => {
    try {
      const { data } = await api.get("/questions");
      const { data: userData } = await api.get("/auth/me");
      const currentUserId = userData.user._id;

      const questionsWithCount = await Promise.all(
        data.map(async (q: any) => {
          let answersCount = 0;
          try {
            const countRes = await api.get(`/question/${q._id}/answers/count`);
            answersCount = countRes.data.count ?? 0;
          } catch (err) {
            console.error("Failed to get answer count for question", q._id, err);
          }

          return {
            ...q,
            liked: q.likedBy?.includes(currentUserId),
            disliked: q.dislikedBy?.includes(currentUserId),
            showAnswers: false,
            likes: q.likes || 0,
            dislikes: q.dislikes || 0,
            answers: [],
            answersCount,
          };
        })
      );

      setQuestions(questionsWithCount);
    } catch (err) {
      console.error("Error fetching questions", err);
    }
  };

const toggleLike = async (id: string) => {
  try {
    const { data: updated } = await api.post(`/question/${id}/like`);
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === id
          ? {
              ...q,
              likes: updated.likes || 0,
              dislikes: updated.dislikes || 0,
              likedBy: updated.likedBy || [],
              dislikedBy: updated.dislikedBy || [],
              liked: updated.likedBy.includes(updated.currentUserId),
              disliked: false, 
            }
          : q
      )
    );
  } catch (err) {
    console.error("Error toggling like", err);
  }
};

const toggleDislike = async (id: string) => {
  try {
    const { data: updated } = await api.post(`/question/${id}/dislike`);
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === id
          ? {
              ...q,
              likes: updated.likes || 0,
              dislikes: updated.dislikes || 0,
              likedBy: updated.likedBy || [],
              dislikedBy: updated.dislikedBy || [],
              disliked: updated.dislikedBy.includes(updated.currentUserId),
              liked: false, 
            }
          : q
      )
    );
  } catch (err) {
    console.error("Error toggling dislike", err);
  }
};

const toggleAnswerLike = async (answerId: string, questionId: string) => {
  try {
    const { data: updated } = await api.post(`/answer/${answerId}/like`);
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a._id === answerId
                  ? {
                      ...a,
                      likes: updated.likes,
                      dislikes: updated.dislikes,
                      likedBy: updated.likedBy,
                      dislikedBy: updated.dislikedBy,
                      liked: updated.likedBy.includes(updated.currentUserId),
                      disliked: false, 
                    }
                  : a
              ),
            }
          : q
      )
    );
  } catch (err) {
    console.error("Error toggling answer like", err);
  }
};

const toggleAnswerDislike = async (answerId: string, questionId: string) => {
  try {
    const { data: updated } = await api.post(`/answer/${answerId}/dislike`);
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a._id === answerId
                  ? {
                      ...a,
                      likes: updated.likes,
                      dislikes: updated.dislikes,
                      likedBy: updated.likedBy,
                      dislikedBy: updated.dislikedBy,
                      disliked: updated.dislikedBy.includes(updated.currentUserId),
                      liked: false, 
                    }
                  : a
              ),
            }
          : q
      )
    );
  } catch (err) {
    console.error("Error toggling answer dislike", err);
  }
};

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/question/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error("Delete error", err);
    }
  };

  const handleDeleteAnswer = async (answerId: string, questionId: string) => {
    try {
      await api.delete(`/answer/${answerId}`);
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === questionId
            ? {
                ...q,
                answers: q.answers.filter((a) => a._id !== answerId),
              }
            : q
        )
      );
    } catch (err) {
      console.error("Delete answer error", err);
    }
  };

  const toggleAnswers = async (id: string) => {
    const updated = [...questions];
    const q = updated.find((q) => q._id === id);
    if (q) {
      if (!q.answers.length) {
        try {
          const { data } = await api.get(`/question/${id}/answers`);
          const updatedAnswers = data.map((a: any) => ({
            ...a,
            liked: a.likedBy?.includes(user?.id),
            disliked: a.dislikedBy?.includes(user?.id),
          }));
          q.answers = updatedAnswers;
          q.answersCount = updatedAnswers.length;
        } catch (err) {
          console.error("Answers load error", err);
        }
      }
      q.showAnswers = !q.showAnswers;
      setQuestions([...updated]);
    }
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswerInputs({ ...answerInputs, [id]: value });
  };

  const submitAnswer = async (id: string) => {
    const answer = answerInputs[id];
    if (!answer?.trim()) return;

    try {
      const { data: newAnswer } = await api.post(`/question/${id}/answers`, {
        text: answer,
      });
      setQuestions((prev) =>
        prev.map((q) =>
          q._id === id
            ? {
                ...q,
                answers: [...q.answers, newAnswer],
                answersCount: (q.answersCount || 0) + 1,
              }
            : q
        )
      );
      setAnswerInputs((prev) => ({ ...prev, [id]: "" }));
    } catch (err) {
      console.error("Answer submit error", err);
    }
  };

  return (
    <div className={styles.page}>
      <Sidebar />
      <main className={styles.main}>
        <h1 className={styles.heading}>What’s on your mind?</h1>
        <p className={styles.subheading}>Browse questions or ask your own</p>

        {isAuth && (
          <div className={styles.askWrapper}>
            <Link href="/Ask" className={styles.askBtn}>
              + Ask Question
            </Link>
          </div>
        )}

        <div className={styles.filterWrapper}>
          <label htmlFor="filter" className={styles.filterLabel}>
            Filter:
          </label>
          <select
            id="filter"
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as "all" | "answered" | "unanswered")
            }
            className={styles.select}
          >
            <option value="all">All</option>
            <option value="answered">Answered</option>
            <option value="unanswered">Unanswered</option>
          </select>
        </div>

        <div className={styles.list}>
          {user &&
            questions
              .filter((q) => {
                if (filter === "answered") return q.answersCount > 0;
                if (filter === "unanswered") return q.answersCount === 0;
                return true;
              })
              .map((q) => (
                <div key={q._id} className={styles.card}>
                  <p className={styles.question}>{q.questionText}</p>

                  <div className={styles.meta}>
                    <span>{q.userName}</span>
                    <span>{dayjs(q.date).format("YYYY-MM-DD HH:mm")}</span>

                    <span>
                      <button
                        onClick={() => toggleLike(q._id)}
                        className={`${styles.likeBtn} ${q.liked ? styles.liked : ""}`}
                      >
                        <Image src="/icons/heart.png" alt="Like" width={20} height={20} />
                        {q.likes}
                      </button>

                      <button
                        onClick={() => toggleDislike(q._id)}
                        className={`${styles.likeBtn} ${q.disliked ? styles.liked : ""}`}
                        style={{ marginLeft: "12px" }}
                      >
                        <Image src="/icons/broken-heart.png" alt="Dislike" width={20} height={20} />
                        {q.dislikes}
                      </button>
                    </span>

                    {user?._id === q.user_id && (
                      <button
                        onClick={() => handleDelete(q._id)}
                        className={styles.deleteBtn}
                      >
                        🗑️ Delete
                      </button>
                    )}

                    <button
                      onClick={() => toggleAnswers(q._id)}
                      className={styles.toggleBtn}
                    >
                      {q.showAnswers ? "Hide" : "Show"} Answers ({q.answersCount ?? 0})
                    </button>
                  </div>

                  {q.showAnswers && (
                    <div className={styles.answersBlock}>
                      {q.answers.map((a) => (
                        <div key={a._id} className={styles.answer}>
                          <p>{a.text}</p>
                          <span>
                            {a.user_name} • {dayjs(a.date).format("YYYY-MM-DD HH:mm")}
                          </span>

                          <div className={styles.meta}>
                            <button
                              onClick={() => toggleAnswerLike(a._id, q._id)}
                              className={`${styles.likeBtn} ${a.liked ? styles.liked : ""}`}
                            >
                              <Image src="/icons/heart.png" alt="Like" width={20} height={20} />
                              {a.likes}
                            </button>

                            <button
                              onClick={() => toggleAnswerDislike(a._id, q._id)}
                              className={`${styles.likeBtn} ${a.disliked ? styles.liked : ""}`}
                            >
                              <Image
                                src="/icons/broken-heart.png"
                                alt="Dislike"
                                width={20}
                                height={20}
                              />
                              {a.dislikes}
                            </button>

                            {user?._id === a.user_id && (
                              <button
                                className={styles.deleteBtn}
                                onClick={() => handleDeleteAnswer(a._id, q._id)}
                              >
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}

                      {isAuth && (
                        <div className={styles.form}>
                          <textarea
                            placeholder="Write your answer..."
                            value={answerInputs[q._id] || ""}
                            onChange={(e) =>
                              handleAnswerChange(q._id, e.target.value)
                            }
                            rows={3}
                            className={styles.input}
                          />
                          <button
                            onClick={() => submitAnswer(q._id)}
                            className={styles.btn}
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
        </div>
      </main>
    </div>
  );
}
