import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
} from "bun:test";
import { close, db, init } from "../../mongodb";
import { Collection } from "mongodb";
import { postTransaction } from "../post-transaction";
import { LimitNotAvailableError } from "../../errors";

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

  describe("Credit", () => {
    test("Should add credit to user account correctly", async () => {
      await accountCollection.insertOne({
        userId: 10,
        limite: 10000,
      });

      const result = await postTransaction({
        descricao: "any-desc",
        tipo: "c",
        userId: 10,
        valor: 1000,
      });
      expect(result).toEqual({
        limite: 10000,
        saldo: 1000,
      });
    });
  });

  describe("Debit", () => {
    test("Should debit to user account correctly", async () => {
      await accountCollection.insertOne({
        userId: 10,
        limite: 10000,
      });

      const result = await postTransaction({
        descricao: "any-desc",
        tipo: "d",
        userId: 10,
        valor: 1000,
      });
      expect(result).toEqual({
        limite: 10000,
        saldo: -1000,
      });
    });
    test("Should not be able to debit user account because of limit", async () => {
      await accountCollection.insertOne({
        userId: 10,
        limite: 10000,
      });

      expect(
        async () =>
          await postTransaction({
            descricao: "any-desc",
            tipo: "d",
            userId: 10,
            valor: 10001,
          })
      ).toThrow(new LimitNotAvailableError());
    });
  });

  describe("Complete - credit and debit", () => {
    test("Should add credit and debit to user account correctly", async () => {
      await accountCollection.insertOne({
        userId: 10,
        limite: 10000,
      });

      // debit 1000
      await postTransaction({
        descricao: "any-desc",
        tipo: "d",
        userId: 10,
        valor: 1000,
      });

      // debit 2000
      await postTransaction({
        descricao: "any-desc",
        tipo: "d",
        userId: 10,
        valor: 2000,
      });

      // credit 5000
      const result = await postTransaction({
        descricao: "any-desc",
        tipo: "c",
        userId: 10,
        valor: 5000,
      });
      expect(result).toEqual({
        limite: 10000,
        saldo: 2000,
      });
    });
  });
});
