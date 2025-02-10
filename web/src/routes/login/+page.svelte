<script lang="ts">
  import type { PageData } from "./$types";
  import LoginForm from "$lib/components/forms/login-form.svelte";

  let data: PageData = $props();
</script>

<div class="flex flex-1 items-center mx-auto min-w-80 lg:w-1/2">
  <div
    class="flex flex-col p-12 border border-gray-300 rounded-lg min-w-full gap-4"
  >
    <h2 class="text-2xl font-semibold text-gray-800">Login</h2>
    <!-- TODO - Fix type error -->
    <LoginForm data={data.form} />
  </div>
</div>
