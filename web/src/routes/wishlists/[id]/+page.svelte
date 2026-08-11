<script lang="ts">
  import AddItemModal from "$lib/components/wishlist/add-item-modal.svelte";
  import ShareWishlistModal from "$lib/components/wishlist/share-wishlist-modal.svelte";
  import Toast from "$lib/components/common/toast.svelte";

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

  {#if gifts.length === 0}
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
      {#each gifts as gift, index (gift.id)}
        {@const isEditing = editingGiftId === gift.id}
        {@const isDragging = draggedIndex === index}
        {@const isTarget = dragOverIndex === index}
        <div
          draggable={props.data.isOwner && !isEditing}
          ondragstart={(e) => props.data.isOwner && handleDragStart(e, index)}
          ondragover={(e) => props.data.isOwner && handleDragOver(e, index)}
          ondragleave={() => props.data.isOwner && handleDragLeave(index)}
          ondrop={(e) => props.data.isOwner && handleDrop(e, index)}
          ondragend={() => props.data.isOwner && handleDragEnd()}
          class="w-full flex items-start gap-4 p-6 rounded-2xl border transition-all duration-200 {isDragging ? 'opacity-40 border-dashed border-indigo-400 bg-white' : isTarget ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/20' : isEditing ? 'bg-white border-indigo-400 ring-2 ring-indigo-200/50 shadow-sm' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}"
        >
          <div class="flex items-center gap-2 bg-slate-100/80 border border-slate-200/80 rounded-2xl px-3 py-1.5 shadow-xs shrink-0 select-none mt-1">
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
                  class="text-[10px] text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30 p-0"
                  disabled={index === 0 || isEditing}
                  onclick={() => moveItem(index, "up")}
                  title="Move up"
                >
                  Up
                </button>
                <button
                  type="button"
                  class="text-[10px] text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-30 p-0"
                  disabled={index === gifts.length - 1 || isEditing}
                  onclick={() => moveItem(index, "down")}
                  title="Move down"
                >
                  Down
                </button>
              </div>
            {/if}
          </div>

          <form
            onsubmit={(e) => {
              e.preventDefault();
              if (isEditing) saveEditing(gift.id);
            }}
            class="flex-1 flex flex-col gap-3 min-w-0"
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
                  <h3 class="text-xl font-bold text-slate-900 leading-tight">
                    {gift.name}
                  </h3>
                  {#if gift.link}
                    <a
                      href={gift.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors truncate block"
                    >
                      {gift.link}
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
