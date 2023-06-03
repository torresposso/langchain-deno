import { Head } from "$fresh/runtime.ts";
import Chat from "../islands/Chat.tsx";

export default function Home() {
  return (
    <>
      <Head>
        <title>langChain Test App</title>
      </Head>
      <div class="p-4 mx-auto max-w-screen-md bg-gray-900">
        <Chat />
      </div>
    </>
  );
}
