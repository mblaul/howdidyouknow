<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import * as Alert from "$lib/components/ui/alert";
  import { fade, fly } from "svelte/transition";
  import { loginFormSchema, type LoginFormSchema } from "./form.schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  let data: SuperValidated<Infer<LoginFormSchema>> = $props();

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(loginFormSchema),
    onUpdated: handleOnUpdated,
  });

  const { form: formData, enhance } = form;

  function handleOnUpdated() {
    wasSuccessfulSubmit = true;
  }

  let wasSuccessfulSubmit: boolean = $state(false);
  let showSuccessMsg: boolean = $state(false);
</script>

<form class="flex flex-col gap-3" method="POST" use:enhance>
  {#if !wasSuccessfulSubmit}
    <div
      class="flex flex-col gap-2"
      transition:fade={{ duration: 250 }}
      onoutroend={() => (showSuccessMsg = true)}
    >
      <Form.Field {form} name="email">
        <Form.Control let:attrs>
          <Form.Label>Email</Form.Label>
          <Input {...attrs} bind:value={$formData.email} />
        </Form.Control>
        <Form.Description
          >Please enter an email to login or create an account</Form.Description
        >
        <Form.FieldErrors />
      </Form.Field>
      <Form.Button>Submit</Form.Button>
    </div>
  {/if}
  {#if showSuccessMsg}
    <div transition:fade={{ duration: 1000 }}>
      <Alert.Root>
        <Alert.Title>Success ✅</Alert.Title>
        <Alert.Description>
          Check your email for a link to login.
        </Alert.Description>
      </Alert.Root>
    </div>
  {/if}
</form>
