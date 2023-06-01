import { Head } from "$fresh/runtime.ts";
import Counter from "../islands/Counter.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>langChain Test App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md">
        <div>
          <h1>hello World</h1>
        </div>
      </div>
    </>
  );
}
