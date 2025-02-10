<script lang="ts">
  import { page } from "$app/state";
</script>

<header
  class="flex items-center justify-between p-4 bg-gray-950 text-white bg-gr"
>
  <a href="/" class="text-xl font-semibold text-wrap word-break"
    >howdidyouknow</a
  >
  <nav class="flex gap-4">
    {#if page.data.sessionId}
      <a href="/wishlists" class="hover:underline">Wishlists</a>
      <a href="/logout" class="hover:underline">Logout</a>
    {:else}
      <a href="/login" class="hover:underline">Login</a>
    {/if}
  </nav>
</header>
