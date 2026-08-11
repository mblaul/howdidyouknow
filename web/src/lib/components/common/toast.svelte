<script lang="ts">
  import { fade, fly } from "svelte/transition";

  let { message = "", show = $bindable(false) }: { message: string; show: boolean } = $props();

  $effect(() => {
    if (show) {
      const timer = setTimeout(() => {
        show = false;
      }, 3000);
      return () => clearTimeout(timer);
    }
  });
</script>

{#if show}
  <div
    in:fly={{ y: 20, duration: 250 }}
    out:fade={{ duration: 200 }}
    class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl text-sm font-medium flex items-center gap-2 border border-slate-800"
  >
    <span>{message}</span>
  </div>
{/if}
