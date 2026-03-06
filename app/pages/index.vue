<script setup lang="ts">
const quickChecks = [
    { label: 'Health', path: '/api/health' },
    { label: 'KV Keys', path: '/api/kv' },
    { label: 'Files', path: '/api/files' },
]
</script>

<template>
    <main class="home">
        <section class="card">
            <p class="eyebrow">Authenticated Area</p>
            <h1>Nuxt + Cloudflare Starter</h1>
            <p class="body">
                Authentication is handled by Better Auth. Auth users are managed through
                <code>/api/auth/*</code> endpoints and configured plugins.
            </p>
            <ul>
                <li v-for="check in quickChecks" :key="check.path">
                    <a :href="check.path" target="_blank" rel="noreferrer">{{ check.label }}: {{ check.path }}</a>
                </li>
            </ul>
        </section>
    </main>
</template>

<style scoped>
.home {
    min-height: calc(100vh - 56px);
    display: grid;
    place-items: center;
    padding: 1.5rem;
    background: linear-gradient(180deg, #f7f5ef, #ece6d6);
}

.card {
    width: min(720px, 100%);
    background: #fffdf8;
    border: 1px solid #ded6c4;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(67, 56, 32, 0.08);
}

.eyebrow {
    margin: 0;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #856f3f;
}

h1 {
    margin: 0.5rem 0 0.75rem;
    color: #2f2616;
}

.body {
    margin: 0 0 1rem;
    color: #4d422f;
}

ul {
    margin: 0;
    padding-left: 1.125rem;
}

a {
    color: #7a4c18;
}

a:hover {
    color: #4f2f0f;
}
</style>
