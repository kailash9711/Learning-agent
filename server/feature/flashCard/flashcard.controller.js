import Flashcard from "../flashCard/flashcard.model.js";

const normalizeDocumentId = (value) => {
  const raw = typeof value === "object" && value !== null
    ? value._id ?? value.id ?? value.documentId
    : value;

  return raw ? String(raw) : "";
};

// Get all flashcard sets for a user
export const getFlashcards = async (req, res) => {
    try {
        const flashcards = await Flashcard.find({
      userId: req.user._id,
      documentId: req.params.documentId
    })
    .populate('documentId', 'title fileName')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcards.length,
      data: flashcards
    });
    } catch (error) {
        
    }
};

/*
getAllFlashcardSets - Sabhi flashcard sets ko retrieve karta hai
*/

export const getAllFlashcardSets = async (req, res) => {
    try {
        const flashcardSets = await Flashcard.find({
      userId: req.user._id
    })
    .populate('documentId', 'title fileName')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: flashcardSets.length,
      data: flashcardSets
    });
    } catch (error) {
        next(error);
    }
};

export const reviewFlashcard = async (req, res) => {
    try {
        const flashcardSet = await Flashcard.findOne({
  'cards._id': req.params.cardId,
  userId: req.user._id,
});

if (!flashcardSet) {
  return res.status(404).json({
    success: false,
    error: 'Flashcard set or card not found',
    statusCode: 404
  });
}

const cardIndex = flashcardSet.cards.findIndex(
  (card) => card._id.toString() === req.params.cardId
);

if (cardIndex === -1) {
  return res.status(404).json({
    success: false,
    error: 'Card not found in set',
    statusCode: 404
  });
}

// Review logic - review count badhao aur last reviewed date update karo
flashcardSet.cards[cardIndex].lastReviewed = new Date();
flashcardSet.cards[cardIndex].reviewCount += 1;

await flashcardSet.save();
res.status(200).json({
    success: true,
    data: flashcardSet,
    message: `Flashcard reviewed successfully. Total reviews: ${flashcardSet.cards[cardIndex].reviewCount}`
    } 
    
);

    }
    catch (error) {
        next(error);
    }
};

export const toggleStarFlashcard = async (req, res) => {
    try {
        const flashcardSet = await Flashcard.findOne({'cards._id': req.params.cardId, userId: req.user._id});
        if (!flashcardSet) {
            return res.status(404).json({ success: false, message: 'Flashcard not found' });
        }   
        const cardIndex = flashcardSet.cards.findIndex(card => card._id.toString() === req.params.cardId);
        if (cardIndex === -1) {
            return res.status(404).json({ success: false, message: 'Flashcard not found' });
        }

        //toggle star
        flashcardSet.cards[cardIndex].isStarred = !flashcardSet.cards[cardIndex].isStarred;
        await flashcardSet.save();
        res.status(200).json({ success: true, data: flashcardSet, message: `Flashcard ${flashcardSet.cards[cardIndex].isStarred ? 'starred' : 'unstarred'} successfully` });


            } catch (error) {
        
    }
};

export const deleteFlashcardSet = async (req, res) => {
    try {
        const flashcardSet = await Flashcard.findOne({
  _id: req.params.id,
  userId: req.user._id
});

if (!flashcardSet) {
  return res.status(404).json({
    success: false,
    error: 'Flashcard set not found',
    statusCode: 404
  });
}

await flashcardSet.deleteOne();

res.status(200).json({
  success: true,
  message: 'Flashcard set deleted successfully'
});
    } catch (error) {
        next(error);
    }
};

export const logFlashcardActivity = async (req, res, next) => {
  try {
    const { setId, documentId: rawDocumentId, cardId, action, isCorrect } = req.body;
    const documentId = normalizeDocumentId(rawDocumentId);

    if (!["viewed", "answered"].includes(action)) {
      return res.status(400).json({
        success: false,
        error: "Invalid action. Use viewed or answered",
        statusCode: 400,
      });
    }

    let flashcardSet = null;

    if (setId) {
      flashcardSet = await Flashcard.findOne({ _id: setId, userId: req.user._id });
    } else if (documentId) {
      flashcardSet = await Flashcard.findOne({ documentId, userId: req.user._id });
    }

    if (!flashcardSet) {
      return res.status(404).json({
        success: false,
        error: "Flashcard set not found",
        statusCode: 404,
      });
    }

    flashcardSet.activityHistory.push({
      cardId: cardId || null,
      action,
      isCorrect: typeof isCorrect === "boolean" ? isCorrect : null,
      createdAt: new Date(),
    });

    await flashcardSet.save();

    const latestActivity = flashcardSet.activityHistory[flashcardSet.activityHistory.length - 1];

    res.status(200).json({
      success: true,
      data: latestActivity,
      message: "Flashcard activity tracked successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getFlashcardHistory = async (req, res, next) => {
  try {
    const documentId = normalizeDocumentId(req.query.documentId);
    const query = { userId: req.user._id };

    if (documentId) {
      query.documentId = documentId;
    }

    const sets = await Flashcard.find(query)
      .select("documentId title activityHistory cards")
      .sort({ updatedAt: -1 });

    const history = sets
      .flatMap((set) =>
        (set.activityHistory || []).map((event) => {
          const card = event.cardId
            ? (set.cards || []).find((item) => String(item._id) === String(event.cardId))
            : null;

          return {
            _id: event._id,
            setId: set._id,
            documentId: set.documentId,
            title: set.title,
            cardId: event.cardId,
            cardQuestion: card?.question || null,
            action: event.action,
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
      message: "Flashcard history fetched successfully",
    });
  } catch (error) {
    next(error);
  }
};

