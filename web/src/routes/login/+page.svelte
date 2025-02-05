<script lang="ts">
  import type { PageData } from "./$types";
  import LoginForm from "$lib/components/forms/login-form.svelte";

  export let data: PageData;
</script>

<div class="flex flex-1 items-center mx-auto max-w-lg">
  <div
    class="flex flex-col p-12 border border-gray-300 rounded-lg w-full gap-4"
  >
    <h2 class="text-2xl font-semibold text-gray-800">Login</h2>
    <LoginForm data={data.form} />
  </div>
</div>
