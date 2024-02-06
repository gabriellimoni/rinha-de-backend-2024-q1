import { db, init } from "./src/mongodb";

init().then(() => {
  Bun.serve({
    port: process.env.PORT,
    async fetch(req) {
      return new Response(`Hello world ${process.env.PORT}`);
    },
  });
});
