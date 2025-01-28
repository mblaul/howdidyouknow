<script>
  import { signIn } from '$lib/auth-client'; 
</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<button onclick={async () => {
  await signIn.social({
    provider: 'discord'
  })
}}>Test</button>