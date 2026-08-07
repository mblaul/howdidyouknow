<script lang="ts">
  import AddItemModal from "$lib/components/wishlist/add-item-modal.svelte";

  let props = $props();
  let wishlist = $state(props.data.wishlist);
  let gifts = $state(props.data.gifts);
  let formData = $derived(props.data.form);

  let isModalOpen = $state(false);
  let editingGiftId = $state<string | null>(null);

  let editFields = $state<Record<string, { name: string; link: string; description: string }>>({});

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

    const res = await fetch("/wishlists", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: giftId,
        name: dataToSave.name,
        link: dataToSave.link || null,
        description: dataToSave.description || null
      })
    });

    if (res.ok) {
      const gift = gifts.find(g => g.id === giftId);
      if (gift) {
        gift.name = dataToSave.name;
        gift.link = dataToSave.link || null;
        gift.description = dataToSave.description || null;
      }
      editingGiftId = null;
    }
  }

  async function updatePosition(giftId: string, newPosition: number) {
    if (newPosition < 0) return;
    const res = await fetch("/wishlists", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: giftId, position: newPosition })
    });
    if (res.ok) {
      const gift = gifts.find(g => g.id === giftId);
      if (gift) {
        gift.position = newPosition;
        gifts = [...gifts].sort((a, b) => a.position - b.position);
      }
    }
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
      }
    }
  }
</script>

<div class="max-w-4xl mx-auto px-4 py-8 flex flex-col gap-8">
  <div class="flex items-center gap-2">
    <a href="/wishlists" class="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
      ← Back to Wishlists
    </a>
  </div>

  <div class="flex justify-between items-center border-b border-slate-200 pb-6">
    <div>
      <h1 class="text-4xl font-extrabold text-slate-900 tracking-tight">{wishlist.name}</h1>
      <p class="text-slate-500 mt-1">Items in this wishlist, ordered by preference.</p>
    </div>
    <button
      type="button"
      onclick={() => (isModalOpen = true)}
      class="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 transition-colors"
    >
      Add Item
    </button>
  </div>

  {#if gifts.length === 0}
    <div class="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-center gap-4">
      <div class="flex flex-col gap-1">
        <h3 class="text-lg font-bold text-slate-900">This list is empty</h3>
        <p class="text-sm text-slate-500 max-w-sm">Start adding items to your wishlist using the "Add Item" button above.</p>
      </div>
    </div>
  {:else}
    <div class="flex flex-col gap-4">
      {#each gifts as gift, index (gift.id)}
        {@const isEditing = editingGiftId === gift.id}
        <form
          onsubmit={(e) => {
            e.preventDefault();
            if (isEditing) saveEditing(gift.id);
          }}
          class="flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 {isEditing ? 'bg-indigo-50/40 border-indigo-300 shadow-md' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}"
        >
          <!-- Re-ordering & Position controls -->
          <div class="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-2 border border-slate-100 min-w-[70px] shrink-0">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Pos</span>
            <input
              type="number"
              value={gift.position}
              disabled={isEditing}
              class="w-12 text-center font-extrabold text-slate-800 bg-transparent border-b-2 border-slate-300 focus:border-indigo-500 outline-none text-lg disabled:opacity-50"
              onchange={(e) => updatePosition(gift.id, Number((e.target as HTMLInputElement).value))}
            />
            <div class="flex gap-1 mt-2">
              <button
                type="button"
                class="text-sm p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                disabled={gift.position <= 0 || isEditing}
                onclick={() => updatePosition(gift.id, gift.position - 1)}
              >
                ▲
              </button>
              <button
                type="button"
                class="text-sm p-1 hover:bg-slate-200 rounded transition-colors disabled:opacity-30"
                disabled={isEditing}
                onclick={() => updatePosition(gift.id, gift.position + 1)}
              >
                ▼
              </button>
            </div>
          </div>

          <!-- Item Details Form/Display -->
          <div class="flex-1 flex flex-col gap-2 min-w-0">
            <div class="flex items-center justify-between gap-4">
              {#if isEditing}
                <input
                  type="text"
                  required
                  bind:value={editFields[gift.id].name}
                  class="w-full text-lg font-bold text-slate-900 bg-white border border-slate-300 rounded-md px-2.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Item name"
                />
              {:else}
                <h3 class="text-lg font-bold text-slate-900 truncate">
                  {#if gift.link}
                    <a href={gift.link} target="_blank" rel="noopener noreferrer" class="hover:text-indigo-600 hover:underline transition-colors">
                      {gift.name} ↗
                    </a>
                  {:else}
                    {gift.name}
                  {/if}
                </h3>
              {/if}

              <!-- Actions -->
              <div class="flex items-center gap-1 shrink-0">
                {#if isEditing}
                  <button
                    type="submit"
                    class="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onclick={cancelEditing}
                    class="text-xs font-semibold px-2.5 py-1.5 rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                {:else}
                  <button
                    type="button"
                    title="Edit item"
                    class="text-xs font-semibold text-slate-600 hover:text-indigo-600 transition-colors p-1.5 rounded-lg hover:bg-slate-100 border border-slate-200"
                    onclick={() => startEditing(gift)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    title="Delete item"
                    class="text-xs font-semibold text-slate-400 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50 border border-transparent"
                    onclick={() => deleteGift(gift.id, index)}
                  >
                    Delete
                  </button>
                {/if}
              </div>
            </div>

            <!-- Link Field -->
            {#if isEditing}
              <input
                type="url"
                bind:value={editFields[gift.id].link}
                class="w-full text-sm text-slate-700 bg-white border border-slate-300 rounded-md px-2.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="https://example.com/item"
              />
            {/if}

            <!-- Description Field -->
            {#if isEditing}
              <textarea
                bind:value={editFields[gift.id].description}
                rows="2"
                class="w-full text-sm text-slate-700 bg-white border border-slate-300 rounded-md px-2.5 py-1 focus:ring-2 focus:ring-indigo-500 outline-none resize-y"
                placeholder="Optional description"
              ></textarea>
            {:else if gift.description}
              <p class="text-sm text-slate-600 line-clamp-2">{gift.description}</p>
            {/if}

            <p class="text-[10px] text-slate-400">Added on {new Date(gift.createdAt).toLocaleDateString()}</p>
          </div>
        </form>
      {/each}
    </div>
  {/if}
</div>

<AddItemModal bind:isOpen={isModalOpen} {formData} />
