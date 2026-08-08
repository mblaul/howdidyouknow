<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { fade } from "svelte/transition";
  import {
    shareWishlistFormSchema,
    type ShareWishlistFormSchema,
  } from "./form.schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import type { Wishlist } from "$lib/db/schema";

  let {
    data,
    wishlists = [],
  }: {
    data: SuperValidated<Infer<ShareWishlistFormSchema>>;
    wishlists?: Wishlist[];
  } = $props();

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(shareWishlistFormSchema),
  });

  const { form: formData, enhance } = form;
</script>

<form class="flex flex-col gap-4" method="POST" action="" use:enhance>
  <div class="flex flex-col gap-4" transition:fade={{ duration: 250 }}>
    <Form.Field {form} name="wishlistId">
      <Form.Control let:attrs>
        <Form.Label>Select Wishlist</Form.Label>
        {#if wishlists.length > 0}
          <select
            {...attrs}
            bind:value={$formData.wishlistId}
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>-- Choose a wishlist --</option>
            {#each wishlists as w}
              <option value={w.id}>{w.name}</option>
            {/each}
          </select>
        {:else}
          <Input {...attrs} bind:value={$formData.wishlistId} placeholder="Wishlist ID" />
        {/if}
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="email">
      <Form.Control let:attrs>
        <Form.Label>Recipient Email</Form.Label>
        <Input {...attrs} bind:value={$formData.email} placeholder="friend@example.com" />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>

    <Form.Button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors">
      Generate Access Token & Share 🔗
    </Form.Button>
  </div>
</form>
