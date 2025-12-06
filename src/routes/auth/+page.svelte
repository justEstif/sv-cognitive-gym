<script lang="ts">
	import { login, register } from './auth.remote';

	const pending = $derived(!!(login.pending || register.pending));
</script>

<svelte:head>
	<title>Sign In | Cognitive Gym</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-200 p-4">
	<div class="w-full max-w-md">
		<h1 class="mb-6 text-center text-3xl font-bold">Cognitive Gym</h1>

		<div class="card bg-base-100 shadow-xl">
			<div class="card-body">
				<form {...login} class="space-y-4">
					<div class="form-control">
						<label class="label" for="username">
							<span class="label-text">Username</span>
						</label>
						<input
							id="username"
							{...login.fields.username.as('text')}
							class="input input-bordered w-full"
							placeholder="Enter your username"
						/>
						{#each login.fields.username.issues() as issue, i (i)}
							<p class="label-text-alt text-error mt-1">{issue.message}</p>
						{/each}
						{#each register.fields.username.issues() as issue, i (i)}
							<p class="label-text-alt text-error mt-1">{issue.message}</p>
						{/each}
						<p class="label-text-alt mt-1 text-base-content/60">
							3-31 characters, lowercase letters, numbers, _ and -
						</p>
					</div>

					<div class="form-control">
						<label class="label" for="password">
							<span class="label-text">Password</span>
						</label>
						<input
							id="password"
							{...login.fields._password.as('password')}
							class="input input-bordered w-full"
							placeholder="Enter your password"
						/>
						{#each login.fields._password.issues() as issue, i (i)}
							<p class="label-text-alt text-error mt-1">{issue.message}</p>
						{/each}
						{#each register.fields._password.issues() as issue, i (i)}
							<p class="label-text-alt text-error mt-1">{issue.message}</p>
						{/each}
						<p class="label-text-alt mt-1 text-base-content/60">Minimum 6 characters</p>
					</div>

					<div class="divider"></div>

					<div role="tablist" class="tabs tabs-border">
						<button type="submit" role="tab" class="tab flex-1" disabled={pending}>
							{#if login.pending}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Sign In
						</button>
						<button
							{...register.buttonProps}
							role="tab"
							class="tab flex-1"
							disabled={pending}
						>
							{#if register.pending}
								<span class="loading loading-spinner loading-sm"></span>
							{/if}
							Register
						</button>
					</div>

					{#each login.fields.allIssues() as issue, i (i)}
						{#if !issue.path?.length}
							<div class="alert alert-error">
								<span>{issue.message}</span>
							</div>
						{/if}
					{/each}
					{#each register.fields.allIssues() as issue, i (i)}
						{#if !issue.path?.length}
							<div class="alert alert-error">
								<span>{issue.message}</span>
							</div>
						{/if}
					{/each}
				</form>
			</div>
		</div>
	</div>
</div>
