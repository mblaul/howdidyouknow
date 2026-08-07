<script lang="ts">
  import type { PageData } from "./$types";
  import CreateGiftForm from "$lib/components/forms/create-gift-form.svelte";

  let data: PageData = $props();
</script>

<div class="max-w-md mx-auto px-4 py-12 flex flex-col gap-6">
  <div class="flex flex-col gap-2">
    <a href="/wishlists/{data.wishlistId}" class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
      ← Back to Wishlist
    </a>
    <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">Add Wishlist Item</h2>
    <p class="text-slate-500 text-sm">Add a name, optional link, description, and position for your new wishlist item.</p>
  </div>
  <div class="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm">
    <!-- TODO - Fix type error on data prop -->
    {/* @ts-ignore */ null}
    <CreateGiftForm data={data.form} />
  </div>
</div>
