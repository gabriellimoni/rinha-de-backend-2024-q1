import { db } from "../mongodb";
import { PostTransactionInput, getSaldo } from "./post-transaction";

export interface GetExtractInput {
  userId: number;
}

export interface GetExtractOutput {
  saldo: {
    total: number;
    data_extrato: string;
    limite: number;
  };
  ultimas_transacoes: {
    valor: number;
    tipo: PostTransactionInput["tipo"];
    descricao: string;
    realizada_em: string;
  }[];
}

export const getExtract = async (
  input: GetExtractInput
): Promise<GetExtractOutput> => {
  const account = await db()
    .collection("accounts")
    .findOne({ userId: input.userId });
  const lastTransactions = await db()
    .collection("transactions")
    .aggregate([
      {
        $match: {
          userId: input.userId,
        },
      },
      {
        $sort: {
          realizada_em: -1,
        },
      },
      {
        $limit: 10,
      },
      {
        $unset: ["_id"],
      },
    ])
    .toArray();

  return {
    saldo: {
      limite: account!.limite,
      data_extrato: new Date().toISOString(),
      total: await getSaldo(input.userId),
    },
    ultimas_transacoes: lastTransactions,
  } as GetExtractOutput;
};
