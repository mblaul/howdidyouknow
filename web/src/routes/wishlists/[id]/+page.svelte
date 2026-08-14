<script lang="ts">
  import AddItemModal from "$lib/components/wishlist/add-item-modal.svelte";
  import ShareWishlistModal from "$lib/components/wishlist/share-wishlist-modal.svelte";
  import Toast from "$lib/components/common/toast.svelte";
  import { flip } from "svelte/animate";

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
  let editFields = $state<Record<string, { name: string; link: string; description: string }>>({});
  let draggedIndex = $state<number | null>(null);
  let dragOverIndex = $state<number | null>(null);

  let previewCache = $state<Record<string, { image?: string | null; favicon?: string; domain?: string }>>({});

  function getDomain(link: string) {
    try {
      const url = new URL(link.startsWith("http") ? link : `https://${link}`);
      return url.hostname.replace(/^www\./, "");
    } catch {
      return link;
    }
  }

  function getFavicon(link: string) {
    const domain = getDomain(link);
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
  }

  $effect(() => {
    for (const gift of gifts) {
      if (gift.link && !(gift.link in previewCache)) {
        previewCache[gift.link] = {
          domain: getDomain(gift.link),
          favicon: getFavicon(gift.link),
          image: null,
        };
        fetch(`/api/preview?url=${encodeURIComponent(gift.link)}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && gift.link) {
              previewCache[gift.link] = {
                domain: data.domain || getDomain(gift.link),
                favicon: data.favicon || getFavicon(gift.link),
                image: data.image || null,
              };
            }
          })
          .catch(() => {});
      }
    }
  });

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
    editingGiftId = gift.id;
    editFields[gift.id] = {
      name: gift.name || "",
      link: gift.link || "",
      description: gift.description || ""
    };
  }

  function cancelEditing() {
    editingGiftId = null;
  }

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

  function handleDragStart(e: DragEvent, index: number) {
    draggedIndex = index;
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", index.toString());
    }
  }

  function handleDragOver(e: DragEvent, index: number) {
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    dragOverIndex = index;
  }

  function handleDragLeave(index: number) {
    if (dragOverIndex === index) dragOverIndex = null;
  }

  function handleDrop(e: DragEvent, dropIndex: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      draggedIndex = null;
      dragOverIndex = null;
      return;
    }

    const newGifts = [...gifts];
    const [draggedItem] = newGifts.splice(draggedIndex, 1);
    newGifts.splice(dropIndex, 0, draggedItem);
    draggedIndex = null;
    dragOverIndex = null;
    persistOrder(newGifts);
  }

  function handleDragEnd() {
    draggedIndex = null;
    dragOverIndex = null;
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

  <div class="flex justify-between items-center border-b border-slate-200 pb-6">
    <div>
      <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">{wishlist.name}</h1>
      <p class="text-slate-500 mt-1">Items in this wishlist, ordered by preference.</p>
    </div>
    {#if props.data.isOwner}
      <div class="flex items-center gap-3">
        <button
          type="button"
          onclick={() => (isShareModalOpen = true)}
          class="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition-colors"
        >
          Share
        </button>
        <button
          type="button"
          onclick={() => (isModalOpen = true)}
          class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
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
    <div class="flex flex-col gap-4 w-full">
      {#each displayedGifts as gift, index (gift.id)}
        {@const isEditing = editingGiftId === gift.id}
        {@const isDragging = draggedIndex === index}
        {@const isTarget = dragOverIndex === index}
        {@const isPurchasedForViewer = !props.data.isOwner && Boolean(gift.purchasedByUserId)}
        <div
          animate:flip={{ duration: 300 }}
          draggable={props.data.isOwner && !isEditing}
          ondragstart={(e) => props.data.isOwner && handleDragStart(e, index)}
          ondragover={(e) => props.data.isOwner && handleDragOver(e, index)}
          ondragleave={() => props.data.isOwner && handleDragLeave(index)}
          ondrop={(e) => props.data.isOwner && handleDrop(e, index)}
          ondragend={() => props.data.isOwner && handleDragEnd()}
          class="w-full flex items-stretch rounded-2xl border overflow-hidden transition-all duration-200 {isDragging ? 'opacity-40 border-dashed border-indigo-400 bg-white' : isTarget ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/20' : isEditing ? 'bg-white border-indigo-400 ring-2 ring-indigo-200/50 shadow-sm' : isPurchasedForViewer ? 'bg-slate-50 border-slate-200 opacity-75 shadow-xs' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}"
        >
          <div class="w-[12%] min-w-[90px] max-w-[130px] bg-slate-100/90 border-r border-slate-200/80 flex flex-row items-center justify-center gap-2.5 p-3 shrink-0 select-none">
            {#if props.data.isOwner}
              <div
                class="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 transition-colors"
                title="Drag to reorder"
              >
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M7 4a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm6-14a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2zm0 7a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
              </div>
            {/if}

            <span class="text-sm font-bold text-slate-800">#{index + 1}</span>

            {#if props.data.isOwner}
              <div class="flex flex-col justify-center gap-0.5 leading-none">
                <button
                  type="button"
                  class="text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-20 p-0"
                  disabled={index === 0 || isEditing}
                  onclick={() => moveItem(index, "up")}
                  title="Move up"
                  aria-label="Move up"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  class="text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-20 p-0"
                  disabled={index === gifts.length - 1 || isEditing}
                  onclick={() => moveItem(index, "down")}
                  title="Move down"
                  aria-label="Move down"
                >
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            {/if}
          </div>

          {#if gift.link && !isEditing}
            {@const preview = previewCache[gift.link]}
            <div class="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-slate-50 border border-slate-200/80 flex items-center justify-center my-auto ml-5 shadow-2xs">
              {#if preview?.image}
                <img
                  src={preview.image}
                  alt={gift.name}
                  class="w-full h-full object-cover"
                />
              {:else}
                <div class="flex flex-col items-center justify-center gap-1 p-2 text-center text-slate-400">
                  {#if preview?.favicon}
                    <img src={preview.favicon} alt="favicon" class="w-7 h-7 object-contain" />
                  {:else}
                    <svg class="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  {/if}
                </div>
              {/if}

              {#if preview?.favicon && preview?.image}
                <div class="absolute bottom-1 right-1 w-5 h-5 rounded-md bg-white p-0.5 shadow-2xs border border-slate-200 flex items-center justify-center">
                  <img src={preview.favicon} alt="" class="w-3.5 h-3.5 object-contain" />
                </div>
              {/if}
            </div>
          {/if}

          <form
            onsubmit={(e) => {
              e.preventDefault();
              if (isEditing) saveEditing(gift.id);
            }}
            class="flex-1 p-6 flex flex-col gap-3 min-w-0"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1 flex flex-col gap-2 min-w-0">
                {#if isEditing}
                  <input
                    type="text"
                    required
                    bind:value={editFields[gift.id].name}
                    class="w-full text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none box-border"
                    placeholder="Item name"
                  />
                  <input
                    type="text"
                    bind:value={editFields[gift.id].link}
                    class="w-full text-sm text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none box-border"
                    placeholder="Link (e.g. https://google.com)"
                  />
                {:else}
                  <h3 class="text-xl font-bold text-slate-900 leading-tight {isPurchasedForViewer ? 'line-through text-slate-500' : ''}">
                    {gift.name}
                  </h3>
                  {#if gift.link}
                    {@const preview = previewCache[gift.link]}
                    <a
                      href={gift.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="inline-flex items-center gap-1.5 text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors max-w-full font-medium"
                    >
                      {#if preview?.favicon}
                        <img src={preview.favicon} alt="" class="w-4 h-4 shrink-0 object-contain" />
                      {/if}
                      <span class="truncate">{preview?.domain || gift.link}</span>
                    </a>
                  {/if}
                {/if}
              </div>

              {#if props.data.isOwner}
                <div class="flex items-center gap-2 shrink-0">
                  {#if isEditing}
                    <button
                      type="submit"
                      class="text-sm font-semibold px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-xs"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onclick={cancelEditing}
                      class="text-sm font-semibold px-4 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  {:else}
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
                  {/if}
                </div>
              {:else}
                <div class="flex items-center gap-2 shrink-0">
                  <label class="flex items-center gap-2 cursor-pointer select-none text-sm font-semibold px-3 py-1.5 rounded-lg border transition-colors {gift.purchasedByUserId ? 'bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'}">
                    <input
                      type="checkbox"
                      checked={Boolean(gift.purchasedByUserId)}
                      onchange={() => togglePurchase(gift.id, Boolean(gift.purchasedByUserId))}
                      class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
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
                class="w-full text-sm text-slate-700 bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
                placeholder="Optional description"
              ></textarea>
            {:else if gift.description}
              <p class="text-sm text-slate-700 line-clamp-2">{gift.description}</p>
            {/if}

            <p class="text-xs text-slate-400">Added on {new Date(gift.createdAt).toLocaleDateString()}</p>
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
