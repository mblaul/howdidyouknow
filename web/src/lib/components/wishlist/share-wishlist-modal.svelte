<script lang="ts">
  let {
    isOpen = $bindable(false),
    wishlistId = "",
    wishlistName = "",
    onSuccess,
  }: {
    isOpen: boolean;
    wishlistId?: string;
    wishlistName?: string;
    onSuccess?: () => void;
  } = $props();

  let email = $state("");
  let loading = $state(false);
  let errorMsg = $state("");

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!email || !wishlistId) return;

    loading = true;
    errorMsg = "";

    try {
      const formData = new FormData();
      formData.append("wishlistId", wishlistId);
      formData.append("email", email);

      const res = await fetch("/wishlists/share", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        email = "";
        isOpen = false;
        if (onSuccess) onSuccess();
      } else {
        errorMsg = "Failed to share wishlist. Please check recipient email.";
      }
    } catch (err) {
      errorMsg = "An error occurred while sharing.";
    } finally {
      loading = false;
    }
  }

  function close() {
    isOpen = false;
    errorMsg = "";
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === "Escape") close();
  }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
    <div
      class="fixed inset-0"
      onclick={close}
      role="presentation"
    ></div>

    <div class="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 p-6 z-10 flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-xl font-bold text-slate-900">
          Share {wishlistName ? `"${wishlistName}"` : "Wishlist"}
        </h3>
        <button
          type="button"
          class="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors text-lg"
          onclick={close}
        >
          ✕
        </button>
      </div>

      <p class="text-sm text-slate-500">
        Enter the email address of the person you want to share this wishlist with.
      </p>

      <form onsubmit={handleSubmit} class="flex flex-col gap-4">
        {#if errorMsg}
          <div class="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        {/if}

        <div class="flex flex-col gap-1.5">
          <label for="recipient-email" class="text-sm font-semibold text-slate-700">
            Recipient Email
          </label>
          <input
            id="recipient-email"
            type="email"
            required
            bind:value={email}
            placeholder="friend@example.com"
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div class="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onclick={close}
            class="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            class="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
          >
            {loading ? "Sharing..." : "Share"}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
