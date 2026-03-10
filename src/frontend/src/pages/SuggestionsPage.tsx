import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  LSH_SUGGESTIONS_KEY,
  type Suggestion,
  getLocalStore,
  setLocalStore,
} from "@/utils/localStore";
import {
  AlertCircle,
  CheckCircle2,
  Lightbulb,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

export function SuggestionsPage() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"suggestion" | "problem_report">(
    "suggestion",
  );
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const existing = getLocalStore<Suggestion[]>(LSH_SUGGESTIONS_KEY, []);
    const newSuggestion: Suggestion = {
      suggestionId: `sug-${Date.now()}`,
      message: message.trim(),
      suggestionType: type,
      timestamp: new Date().toISOString(),
      isRead: false,
      authorNote: "",
      officialReply: "",
    };
    setLocalStore(LSH_SUGGESTIONS_KEY, [...existing, newSuggestion]);

    setLoading(false);
    setSubmitted(true);
    setMessage("");
  };

  const handleReset = () => {
    setSubmitted(false);
    setType("suggestion");
  };

  return (
    <div data-ocid="suggestions.page" className="min-h-screen pb-24 pt-14">
      {/* Header */}
      <div
        className="px-4 py-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.1 0.04 255) 0%, oklch(0.14 0.06 252) 100%)",
        }}
      >
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <h1 className="font-display font-black text-2xl text-foreground flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-primary" />
            Suggestions
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Share your ideas or report a problem
          </p>
        </motion.div>
      </div>

      <div className="px-4 mt-5">
        {submitted ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 flex flex-col items-center gap-3 text-center"
            data-ocid="suggestions.success_state"
          >
            <CheckCircle2 className="w-12 h-12 text-green-400" />
            <h2 className="font-display font-bold text-base text-foreground">
              Thank you!
            </h2>
            <p className="text-sm text-muted-foreground">
              Your {type === "suggestion" ? "suggestion" : "problem report"} has
              been submitted to LSH officials.
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={handleReset}
              className="mt-1"
              data-ocid="suggestions.submit_button"
            >
              Submit Another
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            {/* Info cards */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div
                className="rounded-xl p-3 border flex items-start gap-2"
                style={{
                  background: "oklch(0.18 0.04 252 / 0.5)",
                  borderColor: "oklch(0.35 0.1 252 / 0.4)",
                }}
              >
                <Lightbulb
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: "oklch(0.82 0.16 85)" }}
                />
                <div>
                  <p className="text-[11px] font-bold text-foreground">Ideas</p>
                  <p className="text-[10px] text-muted-foreground">
                    Feature requests & improvements
                  </p>
                </div>
              </div>
              <div
                className="rounded-xl p-3 border flex items-start gap-2"
                style={{
                  background: "oklch(0.18 0.04 24 / 0.5)",
                  borderColor: "oklch(0.45 0.15 24 / 0.4)",
                }}
              >
                <AlertCircle
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  style={{ color: "oklch(0.7 0.2 24)" }}
                />
                <div>
                  <p className="text-[11px] font-bold text-foreground">
                    Problems
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Report bugs or issues
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-4">
              {/* Type selector */}
              <div>
                <Label className="text-xs mb-2 block font-semibold">
                  Type of submission
                </Label>
                <RadioGroup
                  value={type}
                  onValueChange={(v) => setType(v as typeof type)}
                  className="flex gap-4"
                  data-ocid="suggestions.radio"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="suggestion"
                      id="type-suggestion"
                      data-ocid="suggestions.suggestion.radio"
                    />
                    <Label
                      htmlFor="type-suggestion"
                      className="text-sm cursor-pointer"
                    >
                      Suggestion
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem
                      value="problem_report"
                      id="type-problem"
                      data-ocid="suggestions.problem.radio"
                    />
                    <Label
                      htmlFor="type-problem"
                      className="text-sm cursor-pointer"
                    >
                      Problem Report
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Message */}
              <div>
                <Label className="text-xs mb-1 block font-semibold">
                  {type === "suggestion"
                    ? "Your Suggestion *"
                    : "Describe the Problem *"}
                </Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    type === "suggestion"
                      ? "e.g. Add a player ratings section after each match..."
                      : "e.g. The standings table isn't showing goals for/against..."
                  }
                  className="text-sm min-h-[120px] resize-none"
                  data-ocid="suggestions.textarea"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  {message.length}/500 characters
                </p>
              </div>

              <Button
                className="w-full text-sm"
                onClick={handleSubmit}
                disabled={loading || !message.trim()}
                data-ocid="suggestions.submit_button"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.55 0.18 252) 0%, oklch(0.45 0.16 252) 100%)",
                }}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Submit {type === "suggestion" ? "Suggestion" : "Report"}
                  </>
                )}
              </Button>
            </div>

            <p className="text-[11px] text-muted-foreground text-center mt-3">
              Your submission is reviewed by LSH officials. We appreciate your
              input! 🙏
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
