import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { Collection } from "mongodb";
import { close, db, init } from "../../mongodb";
import { randomUUID } from "crypto";
import { getExtract } from "../get-extract";

describe("post-transaction usecase", () => {
  let transactionCollection: Collection;
  let accountCollection: Collection;
  beforeAll(async () => {
    await init("mongodb://localhost:27017");
    transactionCollection = db().collection("transactions");
    accountCollection = db().collection("accounts");
  });
  beforeEach(async () => {
    await Promise.all([
      transactionCollection.deleteMany(),
      accountCollection.deleteMany(),
    ]);
  });
  afterAll(async () => {
    await close();
  });

  test("Should return extract correctly", async () => {
    const transactions = [
      {
        id: randomUUID(),
        realizada_em: new Date(2024, 3, 1, 10, 10, 10, 234567),
        userId: 10,
        valor: 1000,
        tipo: "c",
        descricao: "any-desc",
      },
      {
        id: randomUUID(),
        realizada_em: new Date(2024, 3, 1, 10, 10, 10, 123456),
        userId: 10,
        valor: -1000,
        tipo: "d",
        descricao: "any-desc",
      },
      {
        id: randomUUID(),
        realizada_em: new Date(2024, 2, 1, 10, 10, 10, 234567),
        userId: 10,
        valor: 1000,
        tipo: "c",
        descricao: "any-desc",
      },
      // this should be the first one
      {
        id: randomUUID(),
        realizada_em: new Date(2025, 2, 1, 10, 10, 10, 234567),
        userId: 10,
        valor: -1000,
        tipo: "d",
        descricao: "any-desc",
      },
    ];
    await accountCollection.insertOne({
      userId: 10,
      limite: 0,
    });
    await transactionCollection.insertMany(transactions, {
      forceServerObjectId: true,
    });

    const result = await getExtract({
      userId: 10,
    });
    expect(result.saldo).toEqual({
      data_extrato: expect.any(String),
      limite: 0,
      total: 0,
    });
    expect(result.ultimas_transacoes).toHaveLength(4);
    const mappedTransactions: any = transactions.map((t) => ({
      ...t,
      id: undefined,
      userId: undefined,
    }));
    expect(result.ultimas_transacoes[0]).toEqual(mappedTransactions[3]);
    expect(result.ultimas_transacoes[1]).toEqual(mappedTransactions[0]);
    expect(result.ultimas_transacoes[2]).toEqual(mappedTransactions[1]);
  });
});
