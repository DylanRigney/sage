import { Pinecone } from "@pinecone-database/pinecone";

const apikey = process.env.PINECONE_API_KEY;

if (!apikey) {
  throw new Error("PINECONE_API_KEY is not set");
}

const pinecone = new Pinecone({
  apiKey: apikey,
});

export const predictionsIndex = pinecone.Index("sage-prediction-app");
