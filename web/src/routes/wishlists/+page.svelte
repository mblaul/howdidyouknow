<script lang="ts">
  let props = $props();

  let gifts = $state(props.data.gifts);
</script>

<h1
  class="shadow-md rounded border-1 text-white text-4xl font-medium tracking-tight underline underline-offset-4 bg-slate-950 p-3"
>
  Your Wishlists
</h1>

<h2 class="text-2xl font-medium tracking-tight">Main List</h2>

<a
  href="/wishlists/create"
  class="shadow-md text-white bg-slate-400 border-4 border-slate-400 rounded-md w-max"
>
  <div class="p-1 border-4 bg-slate-900 border-slate-900 rounded-sm">
    Add to List ➡️
  </div>
</a>

{#each gifts as gift, index}
  <div
    class="flex flex-col gap-4 p-3 border-2 border-slate-400 rounded-md shadow-lg"
  >
    <div class="flex flex-col gap-1">
      <div class="flex justify-between">
        <h3 class="text-xl">{gift.name} 🔗</h3>
        <button
          onclick={async () => {
            await fetch("/wishlists", {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id: gift.id }),
            });

            gifts.splice(index, 1);
          }}
        >
          ❌
        </button>
      </div>
      <p class="text-sm text-slate-600">
        {(gift.createdAt as Date).toLocaleDateString()}
      </p>
    </div>
    <p class="text-base">{gift.description}</p>
  </div>
{/each}
