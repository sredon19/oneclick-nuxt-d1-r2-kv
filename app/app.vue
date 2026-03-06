<script setup lang="ts">
import { useAuthClient } from '~/lib/auth-client'

const authClient = useAuthClient()
const session = authClient.useSession()
const sessionData = computed(() => session.value?.data ?? null)

async function signOut() {
    await authClient.signOut()
    navigateTo('/login')
}
</script>

<template>
    <div>
        <nav v-if="sessionData" class="app-nav">
            <span>{{ sessionData.user.email }}</span>
            <button @click="signOut">Sign out</button>
        </nav>
        <NuxtRouteAnnouncer />
        <NuxtPage />
    </div>
</template>

<style scoped>
.app-nav {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 1rem;
    padding: 0.75rem 1.5rem;
    background: #f8f8f8;
    border-bottom: 1px solid #eee;
    font-size: 0.875rem;
}

.app-nav button {
    padding: 0.375rem 0.75rem;
    font-size: 0.8125rem;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: white;
    cursor: pointer;
}

.app-nav button:hover {
    background: #f0f0f0;
}
</style>
