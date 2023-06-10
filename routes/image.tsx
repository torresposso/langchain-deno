import { Handlers } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

export const handler: Handlers = {
  async GET(_req, ctx) {
    const resp = await ctx.render();
    resp.headers.set("X-Custom-Header", "Hello");
    return resp;
  },
};

export default function ImagePage() {
  return (
    <>
      <Head>
        <title>Hello Image</title>
      </Head>
      <main className="text-white flex flex-row min-h-screen justify-center items-center">
        <h1>Image</h1>
        <p>This is the image page.</p>
      </main>
    </>
  );
}
