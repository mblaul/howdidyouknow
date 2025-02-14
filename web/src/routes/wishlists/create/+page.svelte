<script lang="ts">
  import type { PageData } from "./$types";
  import CreateGiftForm from "$lib/components/forms/create-gift-form.svelte";

  let data: PageData = $props();
</script>

<div class="flex flex-1 items-center mx-auto w-full lg:w-1/2">
  <div
    class="flex flex-col p-8 border border-gray-300 rounded-lg min-w-full gap-4"
  >
    <h2 class="text-2xl font-semibold text-gray-800">Create Gift</h2>
    <!-- TODO - Fix type error on data prop -->
    {/* @ts-ignore */ null}
    <CreateGiftForm data={data.form} />
  </div>
</div>
