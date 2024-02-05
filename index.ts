Bun.serve({
  port: process.env.PORT,
  fetch(req) {
    return new Response(`Hello world ${process.env.PORT}`);
  },
});
