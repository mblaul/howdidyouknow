<script lang="ts">
  let props = $props();

  let gifts = $state(props.data.gifts);
</script>

<h2>Main List</h2>
{#each gifts as gift, index}
  <div>
    <h3>{gift.name}</h3>
    <p>{gift.description}</p>
    <p>{gift.createdAt}</p>
    <button
      onclick={async () => {
        const res = await fetch("/wishlists", {
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
<button
  onclick={async () => {
    const res = await fetch("/wishlists", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();

    gifts.unshift(data.gift);
  }}>Add</button
>
