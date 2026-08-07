<script lang="ts">
  import { invalidateAll } from "$app/navigation";
  import CreateGiftForm from "$lib/components/forms/create-gift-form.svelte";
  import type { SuperValidated, Infer } from "sveltekit-superforms";
  import type { CreateGiftFormSchema } from "$lib/components/forms/form.schema";

  let {
    isOpen = $bindable(false),
    formData,
  }: {
    isOpen: boolean;
    formData: SuperValidated<Infer<CreateGiftFormSchema>>;
  } = $props();

  function close() {
    isOpen = false;
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
        <h3 class="text-xl font-bold text-slate-900">Add Item</h3>
        <button
          type="button"
          class="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          onclick={close}
        >
          ✕
        </button>
      </div>

      <CreateGiftForm
        data={formData}
        action="?/addGift"
        onSuccess={() => {
          isOpen = false;
          invalidateAll();
        }}
      />
    </div>
  </div>
{/if}
