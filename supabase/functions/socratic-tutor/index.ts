import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TutorRequest {
  messages: { role: string; content: string }[];
  topic: string;
  questionCount: number;
  confidence: number;
  learningDna: string;
  mistakes: string[];
}

const SOCRATIC_PROMPTS: Record<string, string[]> = {
  "JavaScript Fundamentals": [
    "What do you think happens when JavaScript encounters a variable that hasn't been declared yet?",
    "Can you explain the difference between `let`, `const`, and `var` in your own words?",
    "When would you choose to use a function expression vs a function declaration?",
    "How does the concept of scope affect where you can access a variable?",
    "What role does the event loop play in how JavaScript executes asynchronous code?",
    "If you have a closure, what variables can the inner function access and why?",
    "How would you explain hoisting to someone who's never heard of it?",
    "What's the difference between `==` and `===`, and when might you use each?",
    "How does prototypal inheritance differ from classical inheritance?",
    "What happens under the hood when you use `async/await`?",
  ],
  "React Basics": [
    "Why do you think React uses a virtual DOM instead of manipulating the real DOM directly?",
    "What's the relationship between props and state, and when would you use each?",
    "Can you explain what happens during a React component's lifecycle?",
    "How does the `useEffect` hook relate to lifecycle methods in class components?",
    "What problem does the `key` prop solve when rendering lists?",
    "Why might React batch state updates, and how does that affect your code?",
    "How would you decide between using context vs prop drilling vs a state management library?",
    "What's the difference between controlled and uncontrolled components?",
    "When would you use `useMemo` or `useCallback`, and what happens if you overuse them?",
    "How does React's reconciliation algorithm decide what to update in the DOM?",
  ],
  "Data Structures": [
    "When would you choose an array over a linked list for storing data?",
    "How does a hash map achieve O(1) average lookup time?",
    "What makes a binary search tree different from a regular binary tree?",
    "Why is a stack useful for managing function calls?",
    "How would you decide between BFS and DFS for traversing a graph?",
    "What trade-offs do you make when choosing between a heap and a sorted array?",
    "How does the way you store data affect the time complexity of common operations?",
    "What's the advantage of a doubly-linked list over a singly-linked list?",
    "When would a deque be more useful than a regular queue?",
    "How does the structure of a trie make it efficient for prefix searches?",
  ],
  default: [
    "What do you already know about this topic?",
    "Can you think of an example that illustrates this concept?",
    "What would happen if we changed one part of this - how would the rest be affected?",
    "How would you explain this to someone who's never encountered it before?",
    "What's the connection between this concept and what you learned previously?",
    "Can you identify the key assumptions we're making here?",
    "What would be a counter-example that challenges this idea?",
    "How might this concept apply in a real-world scenario?",
    "What questions do you still have about this?",
    "If you had to teach this concept, what approach would you take?",
  ],
};

function getSocraticQuestion(topic: string, questionCount: number): string {
  const prompts = SOCRATIC_PROMPTS[topic] || SOCRATIC_PROMPTS.default;
  const idx = Math.min(questionCount, prompts.length - 1);
  return prompts[idx];
}

function analyzeStudentResponse(
  studentMessage: string,
  questionCount: number,
  confidence: number,
  mistakes: string[]
): { aiResponse: string; confidenceChange: number; mistakeDetected: boolean; hint: string } {
  const lower = studentMessage.toLowerCase();
  let confidenceChange = 0;
  let mistakeDetected = false;
  let hint = "";

  // Check for uncertainty markers
  const uncertaintyMarkers = ["i don't know", "not sure", "maybe", "i think", "guess", "probably", "uncertain"];
  const hasUncertainty = uncertaintyMarkers.some((m) => lower.includes(m));

  // Check for depth markers
  const depthMarkers = ["because", "therefore", "since", "which means", "this shows", "as a result", "consequently"];
  const hasDepth = depthMarkers.some((m) => lower.includes(m));

  // Check for common mistake patterns
  const mistakePatterns: Record<string, string> = {
    "var is the same as let": "Remember that `var` is function-scoped and hoisted, while `let` is block-scoped. How might this difference cause bugs?",
    "dom directly": "React's virtual DOM batches updates for performance. What could happen if you bypass it?",
    "o(1) always": "Hash maps have O(1) average case, but can degrade. When might that happen?",
    "equals": "The `==` operator performs type coercion. Can you think of a case where this could lead to unexpected results?",
    "mutation": "Mutating state directly can cause bugs. Why might React not detect the change?",
  };

  for (const [pattern, patternHint] of Object.entries(mistakePatterns)) {
    if (lower.includes(pattern)) {
      mistakeDetected = true;
      hint = patternHint;
      break;
    }
  }

  // Very short answers indicate low engagement
  if (studentMessage.length < 15) {
    confidenceChange = -3;
    return {
      aiResponse: "I'd love to hear more of your thinking. Even a guess can help us explore this together. What's your initial intuition about this?",
      confidenceChange,
      mistakeDetected,
      hint,
    };
  }

  if (hasUncertainty && !hasDepth) {
    confidenceChange = -2;
    return {
      aiResponse: "That's a starting point! Uncertainty is part of learning. Let me ask this: what's one thing you DO feel confident about related to this, and what makes you unsure about the rest?",
      confidenceChange,
      mistakeDetected,
      hint,
    };
  }

  if (mistakeDetected) {
    confidenceChange = -1;
    return {
      aiResponse: `I notice something interesting in your reasoning. ${hint} Take a moment to reconsider - how would you revise your understanding?`,
      confidenceChange,
      mistakeDetected,
      hint,
    };
  }

  if (hasDepth) {
    confidenceChange = 5;
    const followUps = [
      "Excellent reasoning! You're making important connections. Now, what would happen if we changed one of the assumptions you mentioned?",
      "That's a thoughtful answer with solid reasoning. Can you think of an edge case where this might not hold true?",
      "Great depth of understanding! How would you apply this concept to solve a different but related problem?",
      "You've identified the key relationships here. What's the next level of complexity we should explore?",
    ];
    return {
      aiResponse: followUps[questionCount % followUps.length],
      confidenceChange,
      mistakeDetected,
      hint,
    };
  }

  if (questionCount > 3) {
    confidenceChange = 3;
    return {
      aiResponse: "You're building a solid foundation. Let me challenge you: can you synthesize what we've discussed so far into a coherent explanation?",
      confidenceChange,
      mistakeDetected,
      hint,
    };
  }

  confidenceChange = 1;
  return {
    aiResponse: "Good thinking! Let me probe a bit deeper - what's the underlying mechanism that makes this work the way it does?",
    confidenceChange,
    mistakeDetected,
    hint,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body: TutorRequest = await req.json();
    const { messages, topic, questionCount, confidence, learningDna, mistakes } = body;

    const lastStudentMessage = messages.filter((m) => m.role === "student").pop()?.content || "";

    let aiResponse: string;
    let confidenceChange: number;
    let mistakeDetected = false;
    let hint = "";

    if (questionCount === 0 && messages.length <= 1) {
      // Opening question
      aiResponse = `Welcome! Let's explore ${topic || "this topic"} together. I won't give you direct answers - instead, I'll guide you to discover them yourself. To start: what do you already know about ${topic || "this subject"}?`;
      confidenceChange = 0;
    } else {
      const analysis = analyzeStudentResponse(lastStudentMessage, questionCount, confidence, mistakes);
      aiResponse = analysis.aiResponse;
      confidenceChange = analysis.confidenceChange;
      mistakeDetected = analysis.mistakeDetected;
      hint = analysis.hint;

      // Every few exchanges, add a Socratic question
      if (questionCount > 0 && questionCount % 2 === 0) {
        const socraticQ = getSocraticQuestion(topic, Math.floor(questionCount / 2));
        aiResponse += `\n\nHere's something to consider: ${socraticQ}`;
      }
    }

    // Adjust based on learning DNA
    if (learningDna === "visual") {
      aiResponse += " Try drawing a diagram of this in your mind - what would it look like?";
    } else if (learningDna === "practical") {
      aiResponse += " Can you think of a hands-on example where you'd apply this?";
    } else if (learningDna === "theory") {
      aiResponse += " What's the theoretical principle underlying this concept?";
    }

    const newConfidence = Math.max(0, Math.min(100, confidence + confidenceChange));

    return new Response(
      JSON.stringify({
        message: aiResponse,
        confidence: newConfidence,
        confidenceChange,
        mistakeDetected,
        hint,
        questionCount: questionCount + 1,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});
