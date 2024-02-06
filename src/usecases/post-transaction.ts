import { LimitNotAvailableError } from "../errors";
import { db } from "../mongodb";
import { randomUUID } from "crypto";

export interface PostTransactionInput {
  userId: number;
  valor: number;
  tipo: "c" | "d";
  descricao: string;
}
export interface PostTransactionOutput {
  limite: number;
  saldo: number;
}

export const postTransaction = async (
  input: PostTransactionInput
): Promise<PostTransactionOutput> => {
  const account = await db()
    .collection("accounts")
    .findOne({ userId: input.userId });

  const saldo = await getSaldo(input.userId);
  if (input.tipo === "d") {
    if (account!.limite + saldo < input.valor) {
      throw new LimitNotAvailableError();
    }
  }

  await db()
    .collection("transactions")
    .insertOne({
      ...input,
      valor: input.tipo === "c" ? input.valor : input.valor * -1,
      id: randomUUID(),
      createdAt: new Date(),
    });

  return {
    limite: account!.limite,
    saldo: await getSaldo(input.userId),
  };
};

const getSaldo = async (userId: number) => {
  const pipeline = db()
    .collection("transactions")
    .aggregate([
      {
        $match: {
          userId,
        },
      },
      {
        $group: {
          _id: null,
          value: {
            $sum: "$valor",
          },
        },
      },
    ]);
  const saldo = await pipeline.next();
  return saldo?.value || 0;
};
