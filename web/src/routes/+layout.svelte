<script lang="ts">
  import "../app.css";
  import Header from "$lib/components/common/header.svelte";
  let { children } = $props();
</script>

<main class="flex flex-col h-full w-full">
  <Header />
  {@render children()}
</main>
