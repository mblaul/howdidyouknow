<script lang="ts">
  let { children } = $props();
</script>

<div class="flex flex-col gap-4 p-4 overflow-y-auto">
  <h1
    class="text-4xl font-semibold tracking-tighter underline underline-offset-8"
  >
    Your Wishlists
  </h1>
  {@render children()}
</div>
