<script lang="ts">
  import ShareWishlistForm from "$lib/components/forms/share-wishlist-form.svelte";

  let { data, form }: { data: any; form: any } = $props();
</script>

<div class="flex flex-1 items-center mx-auto w-full lg:w-1/2 my-8">
  <div class="flex flex-col p-8 border border-slate-200 bg-white rounded-2xl shadow-sm min-w-full gap-6">
    <div class="flex flex-col gap-1">
      <h2 class="text-2xl font-bold text-slate-900">Share Wishlist</h2>
      <p class="text-sm text-slate-500">Generate a unique access token link for a recipient.</p>
    </div>

    {#if form?.success && form?.shareUrl}
      <div class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col gap-3">
        <div class="flex items-center gap-2 text-emerald-800 font-semibold text-sm">
          <span>✅</span> Access token created and email queued!
        </div>
        <div class="flex flex-col gap-1">
          <span class="text-xs font-medium text-slate-600">Share Link:</span>
          <div class="flex gap-2 items-center">
            <input
              type="text"
              readonly
              value={form.shareUrl}
              class="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 select-all outline-none"
            />
            <button
              type="button"
              onclick={() => navigator.clipboard.writeText(form.shareUrl)}
              class="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Copy
            </button>
          </div>
        </div>
      </div>
    {/if}

    <ShareWishlistForm data={data.form} wishlists={data.wishlists} />
  </div>
</div>
