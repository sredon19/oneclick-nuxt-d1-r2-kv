<template>
    <div class="demo-page">
        <h1>🚀 Cloudflare Services Demo</h1>
        <p class="subtitle">Testing D1 Database, KV Storage, and R2 File Storage</p>

        <!-- D1 Database Section -->
        <section class="section">
            <h2>📊 D1 Database (Users)</h2>
            <div class="controls">
                <button @click="fetchUsers" :disabled="loading.users">
                    {{ loading.users ? 'Loading...' : 'Refresh Users' }}
                </button>
                <button @click="showAddUser = !showAddUser" class="secondary">
                    {{ showAddUser ? 'Cancel' : 'Add User' }}
                </button>
            </div>

            <div v-if="showAddUser" class="add-form">
                <input v-model="newUser.email" placeholder="Email" type="email" />
                <input v-model="newUser.name" placeholder="Name (optional)" />
                <button @click="addUser" :disabled="loading.addUser">
                    {{ loading.addUser ? 'Adding...' : 'Create User' }}
                </button>
            </div>

            <div class="status" :class="status.users.type">{{ status.users.message }}</div>

            <div v-if="users.length" class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Name</th>
                            <th>Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in users" :key="user.id">
                            <td>{{ user.id }}</td>
                            <td>{{ user.email }}</td>
                            <td>{{ user.name || '-' }}</td>
                            <td>{{ formatDate(user.createdAt) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="!loading.users" class="empty">No users found</div>
        </section>

        <!-- KV Storage Section -->
        <section class="section">
            <h2>🔑 KV Storage</h2>
            <div class="controls">
                <button @click="fetchKVKeys" :disabled="loading.kv">
                    {{ loading.kv ? 'Loading...' : 'Refresh Keys' }}
                </button>
                <button @click="showAddKV = !showAddKV" class="secondary">
                    {{ showAddKV ? 'Cancel' : 'Add Key-Value' }}
                </button>
            </div>

            <div v-if="showAddKV" class="add-form">
                <input v-model="newKV.key" placeholder="Key" />
                <input v-model="newKV.value" placeholder="Value" />
                <button @click="addKV" :disabled="loading.addKV">
                    {{ loading.addKV ? 'Adding...' : 'Store Value' }}
                </button>
            </div>

            <div class="status" :class="status.kv.type">{{ status.kv.message }}</div>

            <div v-if="kvKeys.length" class="data-list">
                <div v-for="key in kvKeys" :key="key" class="list-item">
                    <span class="key">{{ key }}</span>
                    <button @click="getKVValue(key)" class="small">Get Value</button>
                </div>
            </div>
            <div v-else-if="!loading.kv" class="empty">No keys found</div>

            <div v-if="kvValue.key" class="kv-value">
                <strong>{{ kvValue.key }}:</strong> {{ kvValue.value }}
            </div>
        </section>

        <!-- R2 Storage Section -->
        <section class="section">
            <h2>📁 R2 File Storage</h2>
            <div class="controls">
                <button @click="fetchFiles" :disabled="loading.files">
                    {{ loading.files ? 'Loading...' : 'Refresh Files' }}
                </button>
            </div>

            <div class="status" :class="status.files.type">{{ status.files.message }}</div>

            <div v-if="files.length" class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th>Key</th>
                            <th>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="file in files" :key="file.key">
                            <td>{{ file.key }}</td>
                            <td>{{ formatSize(file.size) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="!loading.files" class="empty">No files found</div>
        </section>

        <!-- Health Check -->
        <section class="section">
            <h2>💚 Health Check</h2>
            <button @click="checkHealth" :disabled="loading.health">
                {{ loading.health ? 'Checking...' : 'Check Health' }}
            </button>
            <div class="status" :class="status.health.type">{{ status.health.message }}</div>
            <pre v-if="healthData" class="health-data">{{ JSON.stringify(healthData, null, 2) }}</pre>
        </section>
    </div>
</template>

<script setup lang="ts">
interface User {
    id: number
    email: string
    name: string | null
    createdAt: string
}

interface FileInfo {
    key: string
    size: number
    etag: string
}

const users = ref<User[]>([])
const kvKeys = ref<string[]>([])
const kvValue = ref<{ key: string; value: unknown }>({ key: '', value: null })
const files = ref<FileInfo[]>([])
const healthData = ref<unknown>(null)

const showAddUser = ref(false)
const showAddKV = ref(false)

const newUser = ref({ email: '', name: '' })
const newKV = ref({ key: '', value: '' })

const loading = ref({
    users: false,
    kv: false,
    files: false,
    health: false,
    addUser: false,
    addKV: false,
})

const status = ref({
    users: { type: '', message: '' },
    kv: { type: '', message: '' },
    files: { type: '', message: '' },
    health: { type: '', message: '' },
})

// Fetch users from D1
async function fetchUsers() {
    loading.value.users = true
    status.value.users = { type: '', message: '' }
    try {
        const response = await $fetch<{ success: boolean; data: User[] }>('/api/users')
        users.value = response.data
        status.value.users = { type: 'success', message: `✓ Loaded ${response.data.length} users from D1` }
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch users'
        status.value.users = { type: 'error', message: `✗ ${message}` }
    }
    finally {
        loading.value.users = false
    }
}

// Add a new user
async function addUser() {
    if (!newUser.value.email) return
    loading.value.addUser = true
    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: { email: newUser.value.email, name: newUser.value.name || undefined },
        })
        newUser.value = { email: '', name: '' }
        showAddUser.value = false
        await fetchUsers()
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to add user'
        status.value.users = { type: 'error', message: `✗ ${message}` }
    }
    finally {
        loading.value.addUser = false
    }
}

// Fetch KV keys
async function fetchKVKeys() {
    loading.value.kv = true
    status.value.kv = { type: '', message: '' }
    try {
        const response = await $fetch<{ success: boolean; data: { keys: string[] } }>('/api/kv')
        kvKeys.value = response.data.keys
        status.value.kv = { type: 'success', message: `✓ Found ${response.data.keys.length} keys in KV` }
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch KV keys'
        status.value.kv = { type: 'error', message: `✗ ${message}` }
    }
    finally {
        loading.value.kv = false
    }
}

// Get a specific KV value
async function getKVValue(key: string) {
    try {
        const response = await $fetch<{ success: boolean; data: { key: string; value: unknown } }>(`/api/kv?key=${encodeURIComponent(key)}`)
        kvValue.value = response.data
    }
    catch {
        kvValue.value = { key, value: 'Error fetching value' }
    }
}

// Add a new KV entry
async function addKV() {
    if (!newKV.value.key) return
    loading.value.addKV = true
    try {
        await $fetch('/api/kv', {
            method: 'POST',
            body: { key: newKV.value.key, value: newKV.value.value },
        })
        newKV.value = { key: '', value: '' }
        showAddKV.value = false
        await fetchKVKeys()
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to add KV entry'
        status.value.kv = { type: 'error', message: `✗ ${message}` }
    }
    finally {
        loading.value.addKV = false
    }
}

// Fetch R2 files
async function fetchFiles() {
    loading.value.files = true
    status.value.files = { type: '', message: '' }
    try {
        const response = await $fetch<{ success: boolean; data: { files: FileInfo[] } }>('/api/files')
        files.value = response.data.files
        status.value.files = { type: 'success', message: `✓ Found ${response.data.files.length} files in R2` }
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to fetch files'
        status.value.files = { type: 'error', message: `✗ ${message}` }
    }
    finally {
        loading.value.files = false
    }
}

// Check health endpoint
async function checkHealth() {
    loading.value.health = true
    status.value.health = { type: '', message: '' }
    try {
        const response = await $fetch('/api/health')
        healthData.value = response
        status.value.health = { type: 'success', message: '✓ Health check passed' }
    }
    catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Health check failed'
        status.value.health = { type: 'error', message: `✗ ${message}` }
        healthData.value = null
    }
    finally {
        loading.value.health = false
    }
}

// Format date
function formatDate(date: string) {
    return new Date(date).toLocaleString()
}

// Format file size
function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// Load data on mount
onMounted(() => {
    fetchUsers()
    fetchKVKeys()
    fetchFiles()
})
</script>

<style scoped>
.demo-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem;
    font-family: system-ui, -apple-system, sans-serif;
}

h1 {
    color: #1a1a1a;
    margin-bottom: 0.5rem;
}

.subtitle {
    color: #666;
    margin-bottom: 2rem;
}

.section {
    background: #f9f9f9;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e0e0e0;
}

h2 {
    margin: 0 0 1rem;
    font-size: 1.25rem;
    color: #333;
}

.controls {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

button {
    background: #0070f3;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s;
}

button:hover:not(:disabled) {
    background: #0060df;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

button.secondary {
    background: #6c757d;
}

button.secondary:hover:not(:disabled) {
    background: #5a6268;
}

button.small {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
}

.add-form {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #ddd;
}

input {
    flex: 1;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 0.875rem;
}

.status {
    font-size: 0.875rem;
    margin-bottom: 1rem;
    min-height: 1.25rem;
}

.status.success {
    color: #28a745;
}

.status.error {
    color: #dc3545;
}

.data-table {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

th, td {
    text-align: left;
    padding: 0.75rem;
    border-bottom: 1px solid #e0e0e0;
}

th {
    background: #f0f0f0;
    font-weight: 600;
}

tr:hover td {
    background: #f5f5f5;
}

.data-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.list-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: white;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
}

.key {
    font-family: monospace;
    color: #333;
}

.kv-value {
    margin-top: 1rem;
    padding: 1rem;
    background: #e8f4fd;
    border-radius: 6px;
    font-family: monospace;
    word-break: break-all;
}

.empty {
    color: #888;
    font-style: italic;
    text-align: center;
    padding: 2rem;
}

.health-data {
    background: #1a1a1a;
    color: #0f0;
    padding: 1rem;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 0.75rem;
    margin-top: 1rem;
}
</style>
