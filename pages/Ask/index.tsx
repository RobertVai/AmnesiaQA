import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import styles from "../Register/register.module.css";
import api from "@/utils/api";
import { useUser } from "@/contexts/UserContext";

const schema = z.object({
  questionText: z.string().min(10, "Question must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

export default function AskPage() {
  const router = useRouter();
  const { user, loading } = useUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await api.post("/api/question", {
        questionText: data.questionText,
      });
      reset();
      router.push("/Questions");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        err.message ||
        "Failed to post question";
      console.error("❌ Submit error:", err);
      alert(msg);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <h1 className={styles.heading}>Ask a Question</h1>
        <p style={{ color: "#fff", textAlign: "center", marginTop: 24 }}>
          You must be logged in to ask a question.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Ask a Question</h1>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Question:</label>
          <textarea
            {...register("questionText")}
            className={styles.input}
            rows={5}
          />
          {errors.questionText && (
            <span className={styles.error} role="alert">
              {errors.questionText.message}
            </span>
          )}
        </div>
        <button type="submit" className={styles.button}>
          Submit Question
        </button>
      </form>
    </div>
  );
}
