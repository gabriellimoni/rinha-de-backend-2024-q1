import { MongoClient } from "mongodb";

const client = new MongoClient("mongodb://mongo:27017");

export const init = async () => {
  await client.connect();
};

export const db = (database?: string) => {
  return client.db(database || "rinha-backend-db");
};
