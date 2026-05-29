import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface BattleRequest {
  topic: string;
  round: number;
  totalRounds: number;
  player1Answer: string;
  player2Answer: string;
  previousQuestion: string;
}

const BATTLE_QUESTIONS: Record<string, string[]> = {
  "JavaScript Fundamentals": [
    "Explain the difference between `==` and `===` and when you'd use each.",
    "What is a closure and why is it useful? Give a practical example.",
    "How does the event loop work? What's the difference between the microtask and macrotask queues?",
    "Explain hoisting. What gets hoisted and what doesn't?",
    "What's the difference between `null` and `undefined`? When does each appear?",
  ],
  "React Basics": [
    "Explain the virtual DOM and why React uses it instead of direct DOM manipulation.",
    "What's the difference between props and state? When should you use each?",
    "Explain the useEffect cleanup function. Why is it important?",
    "What is reconciliation in React? How does it work?",
    "Explain the rules of hooks. Why can't hooks be called inside conditions?",
  ],
  "Data Structures": [
    "Compare arrays and linked lists. When would you choose one over the other?",
    "How does a hash map work internally? What causes collisions and how are they resolved?",
    "Explain the difference between BFS and DFS. When is each more appropriate?",
    "What makes a binary tree a binary SEARCH tree? What's the time complexity of search?",
    "Explain how a stack works. Name three real-world applications of stacks.",
  ],
  default: [
    "Explain this concept as if teaching someone who's never heard of it.",
    "What are the key principles behind this topic? Name at least three.",
    "Describe a real-world scenario where this concept is applied.",
    "What are common misconceptions about this topic?",
    "How does this concept connect to broader principles in the field?",
  ],
};

interface ScoreResult {
  player1Score: number;
  player2Score: number;
  feedback: string;
  winner: "player1" | "player2" | "tie";
}

function evaluateAnswer(answer: string): number {
  if (!answer || answer.length < 10) return 0;

  let score = 0;
  const lower = answer.toLowerCase();

  // Base score for length (effort)
  score += Math.min(answer.length / 20, 5);

  // Depth indicators
  const depthWords = ["because", "therefore", "since", "consequently", "which means", "as a result", "however", "although"];
  score += depthWords.filter((w) => lower.includes(w)).length * 2;

  // Specificity indicators
  const specificIndicators = ["example", "instance", "such as", "specifically", "particularly", "namely"];
  score += specificIndicators.filter((w) => lower.includes(w)).length * 1.5;

  // Technical accuracy indicators (using key terms)
  const technicalIndicators = ["algorithm", "complexity", "implementation", "optimization", "architecture", "pattern"];
  score += technicalIndicators.filter((w) => lower.includes(w)).length * 1;

  // Structure indicators
  if (lower.includes("first") || lower.includes("secondly") || lower.includes("finally")) score += 1;
  if (answer.includes(".") && answer.split(".").length > 2) score += 1;

  return Math.min(Math.round(score), 10);
}

function generateFeedback(p1Score: number, p2Score: number, p1Answer: string, p2Answer: string): string {
  const parts: string[] = [];

  if (p1Score > p2Score) {
    parts.push("Player 1 showed deeper understanding with more detailed reasoning.");
  } else if (p2Score > p1Score) {
    parts.push("Player 2 demonstrated stronger grasp with clearer explanations.");
  } else {
    parts.push("Both players showed comparable understanding!");
  }

  if (p1Answer.length > 20 && p2Answer.length > 20) {
    parts.push("Both players engaged well with the question.");
  }

  parts.push("Remember: depth of understanding beats speed. Focus on explaining WHY, not just WHAT.");

  return parts.join(" ");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: BattleRequest = await req.json();
    const { topic, round, totalRounds, player1Answer, player2Answer, previousQuestion } = body;

    // If we have answers, evaluate them
    if (player1Answer && player2Answer) {
      const p1Score = evaluateAnswer(player1Answer);
      const p2Score = evaluateAnswer(player2Answer);
      const winner = p1Score > p2Score ? "player1" : p2Score > p1Score ? "player2" : "tie";
      const feedback = generateFeedback(p1Score, p2Score, player1Answer, player2Answer);

      const result: ScoreResult = {
        player1Score: p1Score,
        player2Score: p2Score,
        feedback,
        winner,
      };

      // If more rounds, generate next question
      if (round < totalRounds) {
        const questions = BATTLE_QUESTIONS[topic] || BATTLE_QUESTIONS.default;
        const nextQ = questions[round % questions.length];
        return new Response(
          JSON.stringify({
            ...result,
            nextQuestion: nextQ,
            roundComplete: true,
            battleOver: false,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Battle over
      return new Response(
        JSON.stringify({
          ...result,
          roundComplete: true,
          battleOver: true,
          finalFeedback: feedback,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate first question
    const questions = BATTLE_QUESTIONS[topic] || BATTLE_QUESTIONS.default;
    const question = questions[0];

    return new Response(
      JSON.stringify({
        question,
        round: 1,
        totalRounds: totalRounds || 5,
        message: `Battle begins! Round 1 of ${totalRounds || 5}. You each have 60 seconds to answer. Be thorough and explain your reasoning!`,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to process battle request" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
