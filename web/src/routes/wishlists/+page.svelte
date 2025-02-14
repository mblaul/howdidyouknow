<script lang="ts">
  let props = $props();

  let gifts = $state(props.data.gifts);
</script>

<h1
  class="text-4xl font-semibold tracking-tighter underline underline-offset-4"
>
  Your Wishlists
</h1>

<h2>Main List</h2>

<a href="/wishlists/create">Create</a>

{#each gifts as gift, index}
  <div>
    <h3>{gift.name}</h3>
    <p>{gift.description}</p>
    <p>{gift.createdAt}</p>
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
{/each}
