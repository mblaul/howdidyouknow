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

  let data: SuperValidated<Infer<ShareWishlistFormSchema>> = $props();

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(shareWishlistFormSchema),
  });

  const { form: formData, enhance } = form;
</script>

<form class="flex flex-col gap-3" method="POST" action="" use:enhance>
  <div class="flex flex-col gap-2" transition:fade={{ duration: 250 }}>
    <Form.Field {form} name="email">
      <Form.Control let:attrs>
        <Form.Label>Email</Form.Label>
        <Input {...attrs} bind:value={$formData.email} />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Submit</Form.Button>
  </div>
</form>
