<script lang="ts">
  let { children } = $props();
</script>

<div class="flex flex-col gap-4 p-4 overflow-y-auto">
  {@render children()}
</div>
