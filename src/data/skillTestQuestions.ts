export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
}

export const skillTestQuestions: Question[] = [
  {
    id: 1,
    question: "What is the most effective way to begin a teaching session?",
    options: [
      "Jump straight into the material",
      "Set clear objectives and expectations",
      "Ask students to read the material silently",
      "Start with an unrelated ice-breaker"
    ],
    correctAnswer: 1
  },
  {
    id: 2,
    question: "How do you handle students with different learning paces?",
    options: [
      "Focus on the fastest learners",
      "Focus on the slowest learners",
      "Maintain the average pace",
      "Provide differentiated instruction and support"
    ],
    correctAnswer: 3
  },
  {
    id: 3,
    question: "What is the best way to check student understanding?",
    options: [
      "Give a final test",
      "Ask 'Does everyone understand?'",
      "Use formative assessment throughout the session",
      "Wait for students to ask questions"
    ],
    correctAnswer: 2
  },
  {
    id: 4,
    question: "How do you maintain student engagement in an online session?",
    options: [
      "Lecture continuously",
      "Use interactive elements and encourage participation",
      "Show lots of videos",
      "Give frequent breaks"
    ],
    correctAnswer: 1
  },
  {
    id: 5,
    question: "What is the most effective feedback method?",
    options: [
      "General praise or criticism",
      "No feedback to avoid discouragement",
      "Specific, constructive feedback with actionable suggestions",
      "Peer feedback only"
    ],
    correctAnswer: 2
  },
  {
    id: 6,
    question: "How do you handle a student who is struggling with the material?",
    options: [
      "Suggest they find an easier subject",
      "Repeat the same explanation louder",
      "Break down the concept into smaller, manageable parts",
      "Move on to keep the session on schedule"
    ],
    correctAnswer: 2
  },
  {
    id: 7,
    question: "What is the best approach to lesson planning?",
    options: [
      "Improvise based on student reactions",
      "Follow the textbook exactly",
      "Plan with clear objectives, activities, and assessments",
      "Focus only on covering all material"
    ],
    correctAnswer: 2
  },
  {
    id: 8,
    question: "How do you create an inclusive learning environment?",
    options: [
      "Treat everyone exactly the same",
      "Let students figure it out themselves",
      "Acknowledge and accommodate diverse learning needs and backgrounds",
      "Group students by ability"
    ],
    correctAnswer: 2
  }
]; 