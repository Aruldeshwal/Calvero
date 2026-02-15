import { FeedbackForm } from "@/components/feedback/feedback-form";

export default async function FeedbackPage() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <FeedbackForm />
    </div>
  );
}
