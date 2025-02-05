<script lang="ts">
  import * as Form from "$lib/components/ui/form";
  import { Input } from "$lib/components/ui/input";
  import { loginFormSchema, type LoginFormSchema } from "./form.schema";
  import {
    type SuperValidated,
    type Infer,
    superForm,
  } from "sveltekit-superforms";
  import { zodClient } from "sveltekit-superforms/adapters";

  export let data: SuperValidated<Infer<LoginFormSchema>>;

  const form = superForm(data, {
    dataType: "json",
    validators: zodClient(loginFormSchema),
  });

  const { form: formData, enhance } = form;
</script>

<form class="flex flex-col gap-3" method="POST" use:enhance>
  <Form.Field {form} name="email">
    <Form.Control let:attrs>
      <Form.Label>Email</Form.Label>
      <Input {...attrs} bind:value={$formData.email} />
    </Form.Control>
    <Form.Description>Please enter the email for your account</Form.Description>
    <Form.FieldErrors />
  </Form.Field>
  <Form.Button>Submit</Form.Button>
</form>
