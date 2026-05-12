import mongoose from "mongoose";

const dropLegacyUniqueIndexes = async () => {
  const targets = [
    { collection: "flashcards", indexName: "userId_1_documentId_1" },
    { collection: "quizzes", indexName: "userId_1_documentId_1" },
  ];

  for (const target of targets) {
    try {
      const collection = mongoose.connection.collection(target.collection);
      const indexes = await collection.indexes();
      const hasLegacyIndex = indexes.some((index) => index.name === target.indexName && index.unique);

      if (hasLegacyIndex) {
        await collection.dropIndex(target.indexName);
        console.log(`Dropped legacy unique index ${target.indexName} on ${target.collection}`);
      }
    } catch (error) {
      console.warn(`Index cleanup skipped for ${target.collection}: ${error.message}`);
    }
  }
};

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("Database connection skipped: MONGO_URI is not set.");
      return false;
    }

    await mongoose.connect(process.env.MONGO_URI);
    await dropLegacyUniqueIndexes();
    console.log("MongoDB Connected");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
};

export default connectDB;
