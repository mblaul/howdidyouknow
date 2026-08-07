<script lang="ts">
  import type { PageData } from "./$types";
  import CreateWishlistForm from "$lib/components/forms/create-wishlist-form.svelte";

  let data: PageData = $props();
</script>

<div class="max-w-md mx-auto px-4 py-12 flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Wishlist</h2>
    <p class="text-slate-500 text-sm">Add a new empty wishlist for birthdays, holidays, or special events.</p>
  </div>
  <div class="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
    <CreateWishlistForm data={data.form} />
  </div>
</div>
