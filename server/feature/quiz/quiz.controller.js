

export const getQuizzes = async (req, res, next) => {
  try {
    const quizzes = await Quiz.find({
      userId: req.user._id,
      documentId: req.params.documentId
    })
    .populate('documentId', 'title fileName')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes
    });
  } catch (error) {
    next(error);
  }
};

export const getQuizById = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title fileName');

        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }
        res.status(200).json({
            success: true,
            data: quiz,
            message: 'Quiz fetched successfully'
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
    error: 'Please provide answers array',
    statusCode: 400
  });
}

const quiz = await Quiz.findOne({
  _id: req.params.id,
  userId: req.user._id
});

if (!quiz) {
  return res.status(404).json({
    success: false,
    error: 'Quiz not found',
    statusCode: 404
  });

  // Check if quiz is already completed
  // Process answers
let correctCount = 0;
const userAnswers = [];

answers.forEach(answer => {
  const { questionIndex, selectedAnswer } = answer;

  if (questionIndex < quiz.questions.length) {
    const question = quiz.questions[questionIndex];
    const isCorrect = selectedAnswer === question.correctAnswer;

    if (isCorrect) correctCount++;

    userAnswers.push({
      questionIndex,
      selectedAnswer,
      isCorrect,
      answeredAt: new Date()
    });
  }
});


}
    } catch (error) {
        next(error);
    }
};


export const getQuizResults = async (req, res, next) => {
    try {
        const quiz = await Quiz.findOne({
            _id: req.params.id,
            userId: req.user._id
        }).populate('documentId', 'title fileName');
        if (!quiz) {
            return res.status(404).json({
                success: false,
                error: 'Quiz not found',
                statusCode: 404
            });
        }

        if(!quiz.completed) {   
            return res.status(400).json({
                success: false,
                error: 'Quiz not completed yet. Please submit your answers first.',
                statusCode: 400
            });
        }

    } catch (error) {
        next(error);
    }