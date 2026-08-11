<script lang="ts">
  import ShareWishlistModal from "$lib/components/wishlist/share-wishlist-modal.svelte";
  import Toast from "$lib/components/common/toast.svelte";

  let props = $props();
  let wishlists = $state(props.data.wishlists);

  let shareModalOpen = $state(false);
  let selectedWishlist = $state<{ id: string; name: string } | null>(null);
  let showToast = $state(false);
  let toastMessage = $state("");

  function openShareModal(wishlist: { id: string; name: string }) {
    selectedWishlist = wishlist;
    shareModalOpen = true;
  }

  function handleShareSuccess() {
    toastMessage = "Wishlist shared successfully";
    showToast = true;
  }
</script>

<div class="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
  <div class="flex justify-between items-center border-b border-slate-200 pb-6">
    <div>
      <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">Your Wishlists</h1>
      <p class="text-slate-500 mt-1">Manage and share your holiday and birthday wishlists.</p>
    </div>
    <a
      href="/wishlists/new"
      class="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-indigo-600 hover:to-violet-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-all duration-200 hover:scale-[1.02]"
    >
      Create New List
    </a>
  </div>

  {#if wishlists.length === 0}
    <div class="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center gap-4">
      <div class="flex flex-col gap-1">
        <h3 class="text-lg font-bold text-slate-900">No wishlists yet</h3>
        <p class="text-sm text-slate-500 max-w-sm">Create your first wishlist and start adding items you'd love to receive!</p>
      </div>
      <a
        href="/wishlists/new"
        class="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
      >
        Get Started
      </a>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      {#each wishlists as wishlist, index}
        <div class="relative group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-indigo-500/50 transition-all duration-200 flex flex-col justify-between gap-4">
          <div class="flex flex-col gap-2">
            <div class="flex justify-between items-start gap-4">
              <a href="/wishlists/{wishlist.id}" class="text-xl font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                {wishlist.name}
              </a>
              <button
                type="button"
                class="text-xs text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-50"
                onclick={async () => {
                  if (confirm("Are you sure you want to delete this wishlist and all its items?")) {
                    await fetch(`/wishlists/${wishlist.id}`, { method: "DELETE" });
                    wishlists.splice(index, 1);
                  }
                }}
              >
                Delete
              </button>
            </div>
            <p class="text-xs text-slate-400">Created on {new Date(wishlist.createdAt).toLocaleDateString()}</p>
          </div>
          <div class="flex justify-between items-center pt-4 border-t border-slate-100">
            <a href="/wishlists/{wishlist.id}" class="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
              View Items
            </a>
            <button
              type="button"
              onclick={() => openShareModal(wishlist)}
              class="text-sm text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"
            >
              Share
            </button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>

{#if selectedWishlist}
  <ShareWishlistModal
    bind:isOpen={shareModalOpen}
    wishlistId={selectedWishlist.id}
    wishlistName={selectedWishlist.name}
    onSuccess={handleShareSuccess}
  />
{/if}

<Toast message={toastMessage} bind:show={showToast} />
