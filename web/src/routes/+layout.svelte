<script lang="ts">
  import "../app.css";
  let { children } = $props();
</script>

<main class="h-full w-full bg-black">
  {@render children()}
</main>
