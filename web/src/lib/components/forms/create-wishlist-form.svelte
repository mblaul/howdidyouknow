<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { fade } from "svelte/transition";
  import {
    createWishlistFormSchema,
    type CreateWishlistFormSchema,
  } from "./form.schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  let data: SuperValidated<Infer<CreateWishlistFormSchema>> = $props();

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(createWishlistFormSchema),
  });

  const { form: formData, enhance } = form;
</script>

<form class="flex flex-col gap-3" method="POST" action="" use:enhance>
  <div class="flex flex-col gap-2" transition:fade={{ duration: 250 }}>
    <Form.Field {form} name="name">
      <Form.Control let:attrs>
        <Form.Label>List Name</Form.Label>
        <Input {...attrs} bind:value={$formData.name} placeholder="e.g. Birthday Wishlist" />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Create List</Form.Button>
  </div>
</form>
