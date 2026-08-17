<script lang="ts">
  import "../app.css";
  import Header from "$lib/components/common/header.svelte";
  import { onNavigate } from "$app/navigation";

  let { children } = $props();

  onNavigate((navigation) => {
    if (!document.startViewTransition) return;

    return new Promise((resolve) => {
      document.startViewTransition(async () => {
        resolve();
        await navigation.complete;
      });
    });
  });
</script>

<main class="flex flex-col h-full w-full">
  <Header />
  {@render children()}
</main>

