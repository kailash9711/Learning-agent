import Quiz from "../quiz/quiz.model.js";

export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
    })
      .populate("documentId", "title fileName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title fileName");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        error: "Please provide answers array",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    let correctCount = 0;
    const userAnswers = [];

    answers.forEach((answer) => {
      const { questionIndex, selectedAnswer } = answer;

      if (questionIndex < quiz.questions.length) {
        const question = quiz.questions[questionIndex];
        const isCorrect = selectedAnswer === question.correctAnswer;

        if (isCorrect) correctCount += 1;

        userAnswers.push({
          questionIndex,
          selectedOption: selectedAnswer,
          isCorrect,
          answeredAt: new Date(),
        });

        quiz.activityHistory.push({
          questionIndex,
          action: "answered",
          selectedOption: selectedAnswer,
          isCorrect,
          createdAt: new Date(),
        });
      }
    });

    quiz.userAnswer = userAnswers;
    quiz.score = correctCount;
    quiz.totalQuestions = quiz.questions.length;
    quiz.completedAt = new Date();
    await quiz.save();

    res.status(200).json({
      success: true,
      data: quiz,
      message: "Quiz submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizResults = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("documentId", "title fileName");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    if (!quiz.completedAt) {
      return res.status(400).json({
        success: false,
        error: "Quiz not completed yet. Please submit your answers first.",
        statusCode: 400,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        quiz,
        score: quiz.score,
        totalQuestions: quiz.totalQuestions,
        completedAt: quiz.completedAt,
      },
      message: "Quiz results fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteQuiz = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const logQuizActivity = async (req, res, next) => {
  try {
    const { quizId, questionIndex, action, selectedOption, isCorrect } = req.body;

    if (!quizId) {
      return res.status(400).json({
        success: false,
        error: "quizId is required",
        statusCode: 400,
      });
    }

    if (!["viewed", "answered"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Invalid action. Use viewed or answered",
        statusCode: 400,
      });
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: "Quiz not found",
        statusCode: 404,
      });
    }

    quiz.activityHistory.push({
      questionIndex: Number.isInteger(questionIndex) ? questionIndex : null,
      action,
      selectedOption: selectedOption || null,
      isCorrect: typeof isCorrect === "boolean" ? isCorrect : null,
      createdAt: new Date(),
    });

    await quiz.save();

    const latestActivity = quiz.activityHistory[quiz.activityHistory.length - 1];

    res.status(200).json({
      success: true,
      data: latestActivity,
      message: "Quiz activity tracked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizHistory = async (req, res, next) => {
  try {
    const { documentId } = req.query;
    const query = { userId: req.user._id };

    if (documentId) {
      query.documentId = documentId;
    }

    const quizzes = await Quiz.find(query)
      .select("title documentId activityHistory questions")
      .sort({ updatedAt: -1 });

    const history = quizzes
      .flatMap((quiz) =>
        (quiz.activityHistory || []).map((event) => {
          const question = Number.isInteger(event.questionIndex)
            ? quiz.questions[event.questionIndex]
            : null;

          return {
            _id: event._id,
            quizId: quiz._id,
            documentId: quiz.documentId,
            title: quiz.title,
            questionIndex: event.questionIndex,
            question: question?.question || null,
            action: event.action,
            selectedOption: event.selectedOption,
            isCorrect: event.isCorrect,
            createdAt: event.createdAt,
          };
        })
      )
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history,
      message: "Quiz history fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};
