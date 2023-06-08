import { useSignal } from "@preact/signals";
import { useRef } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { JSX } from "preact";

export default function FormStream() {
  const isLoading = useSignal(false);
  const isWriting = useSignal(false);
  const answer = useSignal("");

  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = (e: JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    answer.value = "";
    isLoading.value = true;

    const userInput = new URLSearchParams({
      userInput: inputRef.current!.value,
    });
    const eventSource = new EventSource(
      `/api/chat?${userInput}`,
    );

    eventSource.addEventListener("error", (err) => {
      isLoading.value = false;
      console.error(err);
    });
    eventSource.addEventListener("message", (e: MessageEvent) => {
      isLoading.value = false;
      isWriting.value = true;

      if (e.data === "[DONE]") {
        eventSource.close();
        isWriting.value = false;
        return;
      }

      const completionResponse = JSON.parse(e.data);
      const text = completionResponse.choices[0].delta?.content || "";

      answer.value += text;
    });

    isLoading.value = true;
    e.currentTarget.reset();
  };

  return (
    <>
      <div class="flex flex-col justify-center items-center px-2 ">
        <form
          onSubmit={onSubmit}
          class="flex flex-col gap-2 mb-4 border border-green-200/30 p-4 lg:p-8 w-full lg:px-8 lg:w-4/6 rounded-lg"
        >
          <input
            name="userInput"
            ref={inputRef}
            placeholder={`Search:`}
            disabled={!IS_BROWSER}
            class={`ring-inset ring-1 ring-green-500 border border-green-200/30  text-black flex-1 px-4 py-2  rounded-md outline-none disabled:(opacity-50 cursor-not-allowed) bg-green-100`}
          />
          <button
            disabled={!IS_BROWSER}
            class="mt-5 px-4 py-2 rounded-md text-black  border-white [background-image:var(--gradient-14)] transition duration-300 mx-auto"
          >
            Search
          </button>
        </form>

        <h2 class="py-2 font-semibold text-xl">Results:</h2>

        {isLoading.value
          ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-live="polite"
              aria-busy="true"
              aria-labelledby="title-08a desc-08a"
              class="w-6 h-6"
            >
              <title id="title-08a">Icon title</title>
              <desc id="desc-08a">Some desc</desc>
              <path
                d="M7 8H3V16H7V8Z"
                class="fill-emerald-500 animate animate-bounce "
              />
              <path
                d="M14 8H10V16H14V8Z"
                class="fill-emerald-500 animate animate-bounce  [animation-delay:.2s]"
              />
              <path
                d="M21 8H17V16H21V8Z"
                class="fill-emerald-500 animate animate-bounce  [animation-delay:.4s]"
              />
            </svg>
          )
          : ""}
      </div>
      <div>
        {answer.value && (
          <p class="rounded bg-gray-700 p-4 prose-xl max-w-4xl mx-auto">
            {answer.value}{" "}
            {isWriting.value && (
              <span class="animation-[--animation-blink] text-black">
                █
              </span>
            )}
          </p>
        )}
      </div>
    </>
  );
}
