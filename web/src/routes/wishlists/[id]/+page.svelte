<script lang="ts">
  import AddItemModal from "$lib/components/wishlist/add-item-modal.svelte";
  import ShareWishlistModal from "$lib/components/wishlist/share-wishlist-modal.svelte";
  import Toast from "$lib/components/common/toast.svelte";
  import { flip } from "svelte/animate";
  import { dragHandleZone, dragHandle } from "svelte-dnd-action";

  let props = $props();
  let wishlist = $state(props.data.wishlist);
  let gifts = $state(props.data.gifts);
  let formData = $derived(props.data.form);

  $effect(() => {
    wishlist = props.data.wishlist;
    gifts = props.data.gifts;
  });

  let isModalOpen = $state(false);
  let isShareModalOpen = $state(false);
  let showToast = $state(false);
  let toastMessage = $state("");

  let editingGiftId = $state<string | null>(null);
  let openMenuGiftId = $state<string | null>(null);
  let editFields = $state<Record<string, { name: string; link: string; description: string }>>({});

  function toggleMenu(giftId: string, event: MouseEvent) {
    event.stopPropagation();
    openMenuGiftId = openMenuGiftId === giftId ? null : giftId;
  }

  let displayedGifts = $derived.by(() => {
    if (props.data.isOwner) {
      return gifts;
    }
    return [...gifts].sort((a, b) => {
      const aPurchased = Boolean(a.purchasedByUserId);
      const bPurchased = Boolean(b.purchasedByUserId);
      if (aPurchased !== bPurchased) {
        return aPurchased ? 1 : -1;
      }
      return a.position - b.position;
    });
  });

  function getItemNumber(gift: any, index: number) {
    if (props.data.isOwner) {
      return index + 1;
    }
    const isPurchased = Boolean(gift.purchasedByUserId);
    if (!isPurchased) {
      return index + 1;
    }
    const unpurchasedCount = displayedGifts.filter((g: any) => !g.purchasedByUserId).length;
    return index - unpurchasedCount + 1;
  }

  async function togglePurchase(giftId: string, currentStatus: boolean) {
    const nextStatus = !currentStatus;
    const res = await fetch("/wishlists/purchase", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ giftId, isPurchased: nextStatus })
    });

    if (res.ok) {
      const data = await res.json();
      const gift = gifts.find((g: any) => g.id === giftId);
      if (gift) {
        gift.purchasedByUserId = nextStatus ? props.data.user?.id : null;
        gift.purchasedAt = data.purchasedAt;
      }
    }
  }

  function handleShareSuccess() {
    toastMessage = "Wishlist shared successfully";
    showToast = true;
  }

  function startEditing(gift: any) {
    openMenuGiftId = null;
    editingGiftId = gift.id;
    editFields[gift.id] = {
      name: gift.name || "",
      link: gift.link || "",
      description: gift.description || ""
    };
  }

  function cancelEditing() {
    openMenuGiftId = null;
    editingGiftId = null;
  }

  $effect(() => {
    function handleWindowClick() {
      openMenuGiftId = null;
    }
    if (typeof window !== "undefined") {
      window.addEventListener("click", handleWindowClick);
      return () => window.removeEventListener("click", handleWindowClick);
    }
  });

  async function saveEditing(giftId: string) {
    const dataToSave = editFields[giftId];
    if (!dataToSave || !dataToSave.name.trim()) return;

    let linkToSave = dataToSave.link?.trim() || null;
    if (linkToSave && !/^https?:\/\//i.test(linkToSave)) {
      linkToSave = `https://${linkToSave}`;
    }

    const res = await fetch("/wishlists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: giftId,
        name: dataToSave.name,
        link: linkToSave,
        description: dataToSave.description || null
      })
    });

    if (res.ok) {
      const gift = gifts.find((g: any) => g.id === giftId);
      if (gift) {
        gift.name = dataToSave.name;
        gift.link = linkToSave;
        gift.description = dataToSave.description || null;
      }
      editingGiftId = null;
    }
  }

  async function persistOrder(updatedGifts: any[]) {
    gifts = updatedGifts.map((g: any, idx: number) => ({ ...g, position: idx }));
    await Promise.all(
      gifts.map((g: any) =>
        fetch("/wishlists", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: g.id, position: g.position })
        })
      )
    );
  }

  function moveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gifts.length) return;
    const newGifts = [...gifts];
    const [moved] = newGifts.splice(index, 1);
    newGifts.splice(targetIndex, 0, moved);
    persistOrder(newGifts);
  }

  const flipDurationMs = 150;

  function handleDndConsider(e: CustomEvent<{ items: any[] }>) {
    gifts = e.detail.items;
  }

  function handleDndFinalize(e: CustomEvent<{ items: any[] }>) {
    gifts = e.detail.items;
    persistOrder(gifts);
  }

  async function deleteGift(giftId: string, index: number) {
    if (confirm("Are you sure you want to remove this item?")) {
      const res = await fetch("/wishlists", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: giftId })
      });
      if (res.ok) {
        gifts.splice(index, 1);
        persistOrder(gifts);
      }
    }
  }
</script>

<div class="max-w-4xl w-full mx-auto px-4 py-8 flex flex-col gap-8">
  <div class="flex items-center gap-2">
    <a href="/wishlists" class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
      Back to Wishlists
    </a>
  </div>

  <div class="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-6 gap-4">
    <div>
      <h1 class="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">{wishlist.name}</h1>
      <p class="text-xs sm:text-sm text-slate-500 mt-1">Items in this wishlist, ordered by preference.</p>
    </div>
    {#if props.data.isOwner}
      <div class="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onclick={() => (isShareModalOpen = true)}
          class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
        >
          Share
        </button>
        <button
          type="button"
          onclick={() => (isModalOpen = true)}
          class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
        >
          Add Item
        </button>
      </div>
    {/if}
  </div>

  {#if displayedGifts.length === 0}
    <div class="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center gap-4">
      <div class="flex flex-col gap-1">
        <h3 class="text-lg font-bold text-slate-900">This list is empty</h3>
        <p class="text-sm text-slate-500 max-w-sm">
          {props.data.isOwner ? 'Start adding items to your wishlist using the "Add Item" button above.' : "No items have been added to this wishlist yet."}
        </p>
      </div>
    </div>
  {:else}
    <div
      class="flex flex-col gap-4 w-full outline-none"
      use:dragHandleZone={{
        items: displayedGifts,
        flipDurationMs,
        dragDisabled: !props.data.isOwner || Boolean(editingGiftId),
        useCursorForDetection: true,
        dropTargetStyle: {
          outline: "2px dashed rgba(99, 102, 241, 0.4)",
          outlineOffset: "6px",
          borderRadius: "1rem"
        },
        transformDraggedElement: (element) => {
          if (element) {
            element.style.borderColor = "#818cf8";
            element.style.boxShadow = "0 20px 25px -5px rgba(99, 102, 241, 0.15), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
          }
        }
      }}
      onconsider={handleDndConsider}
      onfinalize={handleDndFinalize}
    >
      {#each displayedGifts as gift, index (gift.id)}
        {@const isEditing = editingGiftId === gift.id}
        {@const isPurchasedForViewer = !props.data.isOwner && Boolean(gift.purchasedByUserId)}
        <div
          animate:flip={{ duration: flipDurationMs }}
          class="w-full flex items-stretch rounded-2xl border transition-all duration-200 {openMenuGiftId === gift.id ? 'relative z-30' : 'relative z-0'} {isEditing ? 'bg-white border-indigo-400 ring-2 ring-indigo-200/50 shadow-sm' : isPurchasedForViewer ? 'bg-slate-50 border-slate-200 opacity-75 shadow-xs' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}"
        >
          <div
            class="bg-slate-100/90 border-r border-slate-200/80 rounded-l-[15px] flex flex-row items-stretch shrink-0 select-none"
          >
            {#if props.data.isOwner}
              <div class="flex flex-col items-center justify-between py-2 px-1.5 sm:px-2 min-h-[90px]">
                <button
                  type="button"
                  class="text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer p-0.5"
                  disabled={index === 0 || isEditing}
                  onclick={(e) => {
                    e.stopPropagation();
                    moveItem(index, "up");
                  }}
                  title="Move up"
                  aria-label="Move up"
                >
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>

                <div
                  use:dragHandle
                  aria-label="Drag handle for {gift.name}"
                  class="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors p-0.5 my-auto"
                  title="Drag to reorder"
                >
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M7 4a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm6-14a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2z" />
                  </svg>
                </div>

                <button
                  type="button"
                  class="text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer p-0.5"
                  disabled={index === gifts.length - 1 || isEditing}
                  onclick={(e) => {
                    e.stopPropagation();
                    moveItem(index, "down");
                  }}
                  title="Move down"
                  aria-label="Move down"
                >
                  <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            {/if}

            <div class="flex items-center justify-center px-3 sm:px-4 min-w-[38px] sm:min-w-[48px]">
              <span class="text-base sm:text-lg font-bold text-slate-800">#{getItemNumber(gift, index)}</span>
            </div>
          </div>

          <form
            onsubmit={(e) => {
              e.preventDefault();
              if (isEditing) saveEditing(gift.id);
            }}
            class="flex-1 p-3 sm:p-6 flex flex-col gap-1.5 sm:gap-3 min-w-0"
          >
            <div class="flex items-start justify-between gap-2 sm:gap-4">
              <div class="flex-1 flex flex-col gap-1 sm:gap-2 min-w-0">
                {#if isEditing}
                  <input
                    type="text"
                    required
                    bind:value={editFields[gift.id].name}
                    class="w-full text-base sm:text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none box-border"
                    placeholder="Item name"
                  />
                  <input
                    type="text"
                    bind:value={editFields[gift.id].link}
                    class="w-full text-xs sm:text-sm text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1 sm:px-3 sm:py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none box-border"
                    placeholder="Link (e.g. https://google.com)"
                  />
                {:else}
                  <h3 class="text-base sm:text-xl font-bold text-slate-900 leading-tight break-words {isPurchasedForViewer ? 'line-through text-slate-500' : ''}">
                    {gift.name}
                  </h3>
                  {#if gift.link}
                    <a
                      href={gift.link.startsWith("http://") || gift.link.startsWith("https://") ? gift.link : `https://${gift.link}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors max-w-full font-medium min-w-0"
                    >
                      <svg class="w-3.5 h-3.5 shrink-0 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span class="truncate block min-w-0">{gift.link}</span>
                    </a>
                  {/if}
                {/if}
              </div>

              {#if props.data.isOwner}
                <div class="flex items-center gap-1 sm:gap-2 shrink-0">
                  {#if isEditing}
                    <button
                      type="submit"
                      class="text-xs sm:text-sm font-semibold px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onclick={cancelEditing}
                      class="text-xs sm:text-sm font-semibold px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  {:else}
                    <!-- Desktop buttons -->
                    <div class="hidden sm:flex items-center gap-2">
                      <button
                        type="button"
                        title="Edit item"
                        class="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 shadow-xs"
                        onclick={() => startEditing(gift)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        title="Delete item"
                        class="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors px-2 py-1.5 rounded-lg hover:bg-red-50 border border-transparent"
                        onclick={() => deleteGift(gift.id, index)}
                      >
                        Delete
                      </button>
                    </div>

                    <!-- Mobile 3-dot dropdown -->
                    <div class="relative sm:hidden">
                      <button
                        type="button"
                        title="More options"
                        aria-label="More options"
                        class="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                        onclick={(e) => toggleMenu(gift.id, e)}
                      >
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>

                      {#if openMenuGiftId === gift.id}
                        <div class="absolute right-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
                          <button
                            type="button"
                            class="w-full text-left px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            onclick={() => startEditing(gift)}
                          >
                            <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            type="button"
                            class="w-full text-left px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"
                            onclick={() => {
                              openMenuGiftId = null;
                              deleteGift(gift.id, index);
                            }}
                          >
                            <svg class="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      {/if}
                    </div>
                  {/if}
                </div>
              {:else}
                <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <label class="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none text-xs sm:text-sm font-semibold px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border transition-colors {gift.purchasedByUserId ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}">
                    <input
                      type="checkbox"
                      checked={Boolean(gift.purchasedByUserId)}
                      onchange={() => togglePurchase(gift.id, Boolean(gift.purchasedByUserId))}
                      class="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                    />
                    <span>
                      {#if gift.purchasedByUserId}
                        {#if gift.purchasedAt}
                          Purchased on {new Date(gift.purchasedAt).toLocaleDateString()}
                        {:else}
                          Purchased
                        {/if}
                      {:else}
                        Mark as Purchased
                      {/if}
                    </span>
                  </label>
                </div>
              {/if}
            </div>

            {#if isEditing}
              <textarea
                bind:value={editFields[gift.id].description}
                rows="2"
                class="w-full text-xs sm:text-sm text-slate-700 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 sm:px-3 sm:py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y min-w-0 max-w-full box-border"
                placeholder="Optional description"
              ></textarea>
            {:else if gift.description}
              <p class="text-xs sm:text-sm text-slate-700 break-words [overflow-wrap:anywhere] whitespace-pre-wrap max-w-full min-w-0">{gift.description}</p>
            {/if}

            <p class="text-[10px] sm:text-xs text-slate-400">Added on {new Date(gift.createdAt).toLocaleDateString()}</p>
          </form>
        </div>
      {/each}
    </div>
  {/if}
</div>

<AddItemModal
  bind:isOpen={isModalOpen}
  {formData}
  action="/wishlists/{wishlist.id}"
/>

<ShareWishlistModal
  bind:isOpen={isShareModalOpen}
  wishlistId={wishlist.id}
  wishlistName={wishlist.name}
  onSuccess={handleShareSuccess}
/>

<Toast message={toastMessage} bind:show={showToast} />
