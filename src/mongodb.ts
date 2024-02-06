import { MongoClient } from "mongodb";

let client: MongoClient;

export const init = async (url?: string) => {
  client = new MongoClient(url || "mongodb://mongo:27017");
  await client.connect();
};
export const close = async () => {
  await client.close(true);
};

export const db = (database?: string) => {
  return client.db(database || "rinha-backend-db");
};
