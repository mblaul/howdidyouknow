<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { fade } from "svelte/transition";
  import {
    createGiftFormSchema,
    type CreateGiftFormSchema,
  } from "./form.schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";
  import { Textarea } from "../ui/textarea";

  let {
    data,
    action = "",
    onSuccess,
  }: {
    data: SuperValidated<Infer<CreateGiftFormSchema>>;
    action?: string;
    onSuccess?: () => void;
  } = $props();

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(createGiftFormSchema),
    onUpdated({ result }) {
      if (result.type === "success" && onSuccess) {
        onSuccess();
      }
    }
  });

  const { form: formData, enhance } = form;
</script>

<form class="flex flex-col gap-3" method="POST" {action} use:enhance>
  <div class="flex flex-col gap-2" transition:fade={{ duration: 250 }}>
    <Form.Field {form} name="name">
      <Form.Control let:attrs>
        <Form.Label>Name</Form.Label>
        <Input {...attrs} bind:value={$formData.name} />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="link">
      <Form.Control let:attrs>
        <Form.Label>Link</Form.Label>
        <Input {...attrs} bind:value={$formData.link} />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="description">
      <Form.Control let:attrs>
        <Form.Label>Description</Form.Label>
        <Textarea {...attrs} bind:value={$formData.description} />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Field {form} name="position">
      <Form.Control let:attrs>
        <Form.Label>Position</Form.Label>
        <Input type="number" {...attrs} bind:value={$formData.position} />
      </Form.Control>
      <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Submit</Form.Button>
  </div>
</form>
