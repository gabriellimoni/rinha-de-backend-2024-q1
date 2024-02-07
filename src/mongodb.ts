import { MongoClient } from "mongodb";

let client: MongoClient;

export const init = async (url?: string) => {
  client = new MongoClient(url || "mongodb://mongo:27017");
  await client.connect();
  await db().collection("transactions").createIndex({
    userId: 1,
    realizada_em: -1,
  });
};
export const close = async () => {
  await client.close(true);
};

export const db = (database?: string) => {
  return client.db(database || "rinha-backend-db");
};
