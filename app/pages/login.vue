<script setup lang="ts">
import { authClient } from '~/lib/auth-client'

const session = authClient.useSession()
const sessionData = computed(() => session.value?.data ?? null)

async function signInWithGoogle() {
    await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
    })
}

watchEffect(() => {
    if (sessionData.value) {
        navigateTo('/')
    }
})
</script>

<template>
    <div class="login-container">
        <div class="login-card">
            <h1>Sign In</h1>
            <p>Sign in with your Google account to continue.</p>
            <button class="google-btn" @click="signInWithGoogle">
                <svg viewBox="0 0 24 24" width="20" height="20" class="google-icon">
                    <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                </svg>
                Continue with Google
            </button>
        </div>
    </div>
</template>

<style scoped>
.login-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background: #f5f5f5;
}

.login-card {
    background: white;
    padding: 3rem;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    text-align: center;
    max-width: 400px;
    width: 100%;
}

.login-card h1 {
    margin: 0 0 0.5rem;
    font-size: 1.75rem;
    color: #1a1a1a;
}

.login-card p {
    margin: 0 0 2rem;
    color: #666;
}

.google-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: 500;
    color: #333;
    background: white;
    border: 1px solid #ddd;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.2s, box-shadow 0.2s;
}

.google-btn:hover {
    background: #f7f7f7;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.google-icon {
    flex-shrink: 0;
}
</style>
