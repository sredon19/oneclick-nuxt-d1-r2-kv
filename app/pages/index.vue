<template>
    <div class="container">
        <header class="header">
            <h1>🚀 Nuxt + Cloudflare Stack Demo</h1>
            <p class="subtitle">Full-stack application with D1 (Drizzle ORM), KV Storage, and R2 Object Storage</p>
        </header>

        <!-- D1 Database with Drizzle -->
        <section class="card">
            <div class="card-header">
                <h2>📊 D1 Database + Drizzle ORM</h2>
                <button @click="refreshUsers" :disabled="loading.users" class="btn-sm">
                    {{ loading.users ? '⏳' : '🔄' }}
                </button>
            </div>
            
            <div class="form-group">
                <input 
                    v-model="newUser.email" 
                    type="email" 
                    placeholder="Email address"
                    @keyup.enter="createUser"
                    class="input"
                />
                <input 
                    v-model="newUser.name" 
                    type="text" 
                    placeholder="Name (optional)"
                    @keyup.enter="createUser"
                    class="input"
                />
                <button @click="createUser" :disabled="loading.createUser || !newUser.email" class="btn-primary">
                    {{ loading.createUser ? 'Creating...' : '➕ Add User' }}
                </button>
            </div>

            <div v-if="status.users" class="status" :class="status.users.type">
                {{ status.users.message }}
            </div>

            <div v-if="users.length" class="table-container">
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
                            <td>{{ user.name || '—' }}</td>
                            <td>{{ formatDate(user.createdAt) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="!loading.users" class="empty">
                No users yet. Add one above!
            </div>
        </section>

        <!-- KV Storage -->
        <section class="card">
            <div class="card-header">
                <h2>🔑 KV Storage</h2>
                <button @click="refreshKV" :disabled="loading.kv" class="btn-sm">
                    {{ loading.kv ? '⏳' : '🔄' }}
                </button>
            </div>

            <div class="form-group">
                <input 
                    v-model="newKV.key" 
                    type="text" 
                    placeholder="Key"
                    @keyup.enter="createKV"
                    class="input"
                />
                <input 
                    v-model="newKV.value" 
                    type="text" 
                    placeholder="Value"
                    @keyup.enter="createKV"
                    class="input"
                />
                <button @click="createKV" :disabled="loading.createKV || !newKV.key" class="btn-primary">
                    {{ loading.createKV ? 'Storing...' : '➕ Store Value' }}
                </button>
            </div>

            <div v-if="status.kv" class="status" :class="status.kv.type">
                {{ status.kv.message }}
            </div>

            <div v-if="kvPairs.length" class="kv-grid">
                <div v-for="item in kvPairs" :key="item.key" class="kv-item">
                    <div class="kv-key">{{ item.key }}</div>
                    <div class="kv-value">{{ item.value }}</div>
                    <button @click="deleteKV(item.key)" class="btn-delete" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            <div v-else-if="!loading.kv" class="empty">
                No KV entries yet. Add one above!
            </div>
        </section>

        <!-- R2 File Storage -->
        <section class="card">
            <div class="card-header">
                <h2>📁 R2 Object Storage</h2>
                <button @click="refreshFiles" :disabled="loading.files" class="btn-sm">
                    {{ loading.files ? '⏳' : '🔄' }}
                </button>
            </div>

            <div class="form-group">
                <input 
                    type="file" 
                    ref="fileInput"
                    @change="handleFileSelect"
                    class="file-input"
                />
                <button 
                    @click="uploadFile" 
                    :disabled="loading.upload || !selectedFile"
                    class="btn-primary"
                >
                    {{ loading.upload ? 'Uploading...' : '⬆️ Upload File' }}
                </button>
            </div>

            <div v-if="status.files" class="status" :class="status.files.type">
                {{ status.files.message }}
            </div>

            <div v-if="files.length" class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Filename</th>
                            <th>Size</th>
                            <th>Type</th>
                            <th>Uploaded</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="file in files" :key="file.key">
                            <td class="filename">{{ extractFilename(file.key) }}</td>
                            <td>{{ formatSize(file.size) }}</td>
                            <td>{{ file.contentType || '—' }}</td>
                            <td>{{ formatDate(file.uploadedAt) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div v-else-if="!loading.files" class="empty">
                No files yet. Upload one above!
            </div>
        </section>

        <!-- Stats Footer -->
        <footer class="footer">
            <div class="stat">
                <div class="stat-value">{{ users.length }}</div>
                <div class="stat-label">Users in D1</div>
            </div>
            <div class="stat">
                <div class="stat-value">{{ kvPairs.length }}</div>
                <div class="stat-label">KV Entries</div>
            </div>
            <div class="stat">
                <div class="stat-value">{{ files.length }}</div>
                <div class="stat-label">R2 Files</div>
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
interface User {
    id: number
    email: string
    name: string | null
    createdAt: string
}

interface KVPair {
    key: string
    value: string
}

interface FileInfo {
    key: string
    size: number
    contentType?: string
    uploadedAt: string
}

// State
const users = ref<User[]>([])
const kvPairs = ref<KVPair[]>([])
const files = ref<FileInfo[]>([])
const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)

const newUser = ref({ email: '', name: '' })
const newKV = ref({ key: '', value: '' })

const loading = ref({
    users: false,
    kv: false,
    files: false,
    createUser: false,
    createKV: false,
    upload: false,
})

const status = ref<Record<string, { type: string; message: string }>>({
    users: { type: '', message: '' },
    kv: { type: '', message: '' },
    files: { type: '', message: '' },
})

// D1 Operations
async function refreshUsers() {
    loading.value.users = true
    status.value.users = { type: '', message: '' }
    try {
        const response = await $fetch<{ success: boolean; data: User[] }>('/api/users')
        users.value = response.data
        status.value.users = { type: 'success', message: `✓ Loaded ${response.data.length} users` }
    }
    catch (error) {
        status.value.users = { type: 'error', message: `✗ ${getErrorMessage(error)}` }
    }
    finally {
        loading.value.users = false
    }
}

async function createUser() {
    if (!newUser.value.email) return
    
    loading.value.createUser = true
    status.value.users = { type: '', message: '' }
    try {
        await $fetch('/api/users', {
            method: 'POST',
            body: { 
                email: newUser.value.email, 
                name: newUser.value.name || undefined 
            },
        })
        newUser.value = { email: '', name: '' }
        await refreshUsers()
        status.value.users = { type: 'success', message: '✓ User created successfully!' }
    }
    catch (error) {
        status.value.users = { type: 'error', message: `✗ ${getErrorMessage(error)}` }
    }
    finally {
        loading.value.createUser = false
    }
}

// KV Operations
async function refreshKV() {
    loading.value.kv = true
    status.value.kv = { type: '', message: '' }
    try {
        const response = await $fetch<{ success: boolean; data: { keys: string[] } }>('/api/kv')
        const keys = response.data.keys
        
        // Fetch values for all keys
        const pairs = await Promise.all(
            keys.map(async (key) => {
                try {
                    const res = await $fetch<{ success: boolean; data: { key: string; value: any } }>(
                        `/api/kv?key=${encodeURIComponent(key)}`
                    )
                    return { key, value: String(res.data.value) }
                }
                catch {
                    return { key, value: 'Error loading value' }
                }
            })
        )
        
        kvPairs.value = pairs
        status.value.kv = { type: 'success', message: `✓ Loaded ${pairs.length} entries` }
    }
    catch (error) {
        status.value.kv = { type: 'error', message: `✗ ${getErrorMessage(error)}` }
    }
    finally {
        loading.value.kv = false
    }
}

async function createKV() {
    if (!newKV.value.key) return
    
    loading.value.createKV = true
    status.value.kv = { type: '', message: '' }
    try {
        await $fetch('/api/kv', {
            method: 'POST',
            body: { key: newKV.value.key, value: newKV.value.value },
        })
        newKV.value = { key: '', value: '' }
        await refreshKV()
        status.value.kv = { type: 'success', message: '✓ KV entry stored!' }
    }
    catch (error) {
        status.value.kv = { type: 'error', message: `✗ ${getErrorMessage(error)}` }
    }
    finally {
        loading.value.createKV = false
    }
}

async function deleteKV(key: string) {
    try {
        await $fetch(`/api/kv?key=${encodeURIComponent(key)}`, { method: 'DELETE' })
        await refreshKV()
        status.value.kv = { type: 'success', message: '✓ Entry deleted!' }
    }
    catch (error) {
        status.value.kv = { type: 'error', message: `✗ ${getErrorMessage(error)}` }
    }
}

// R2 Operations
async function refreshFiles() {
    loading.value.files = true
    status.value.files = { type: '', message: '' }
    try {
        const response = await $fetch<{ success: boolean; data: { files: any[] } }>('/api/files')
        files.value = response.data.files.map((f: any) => ({
            key: f.key,
            size: f.size,
            contentType: f.httpMetadata?.contentType,
            uploadedAt: f.uploaded || new Date().toISOString(),
        }))
        status.value.files = { type: 'success', message: `✓ Loaded ${files.value.length} files` }
    }
    catch (error) {
        status.value.files = { type: 'error', message: `✗ ${getErrorMessage(error)}` }
    }
    finally {
        loading.value.files = false
    }
}

function handleFileSelect(event: Event) {
    const target = event.target as HTMLInputElement
    selectedFile.value = target.files?.[0] || null
}

async function uploadFile() {
    if (!selectedFile.value) return
    
    loading.value.upload = true
    status.value.files = { type: '', message: '' }
    try {
        const formData = new FormData()
        formData.append('file', selectedFile.value)
        formData.append('folder', 'uploads')
        
        await $fetch('/api/files/upload', {
            method: 'POST',
            body: formData,
        })
        
        selectedFile.value = null
        if (fileInput.value) fileInput.value.value = ''
        
        await refreshFiles()
        status.value.files = { type: 'success', message: '✓ File uploaded successfully!' }
    }
    catch (error) {
        status.value.files = { type: 'error', message: `✗ ${getErrorMessage(error)}` }
    }
    finally {
        loading.value.upload = false
    }
}

// Helpers
function formatDate(date: string) {
    return new Date(date).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function extractFilename(key: string) {
    return key.split('/').pop() || key
}

function getErrorMessage(error: any): string {
    if (typeof error === 'string') return error
    return error?.message || error?.data?.message || 'An error occurred'
}

// Load data on mount
onMounted(() => {
    refreshUsers()
    refreshKV()
    refreshFiles()
})
</script>

<style scoped>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.header {
    text-align: center;
    margin-bottom: 3rem;
}

h1 {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1a1a1a;
    margin-bottom: 0.5rem;
}

.subtitle {
    font-size: 1rem;
    color: #666;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e5e5;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
}

h2 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #333;
}

.form-group {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
    flex-wrap: wrap;
}

.input {
    flex: 1;
    min-width: 200px;
    padding: 0.625rem 1rem;
    border: 2px solid #e5e5e5;
    border-radius: 8px;
    font-size: 0.9375rem;
    transition: border-color 0.2s;
}

.input:focus {
    outline: none;
    border-color: #0070f3;
}

.file-input {
    flex: 1;
    padding: 0.5rem;
    font-size: 0.9375rem;
}

button {
    padding: 0.625rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
}

.btn-primary {
    background: #0070f3;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #0060df;
    transform: translateY(-1px);
}

.btn-primary:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
}

.btn-sm {
    padding: 0.375rem 0.75rem;
    background: #f5f5f5;
    color: #666;
    font-size: 1rem;
}

.btn-sm:hover:not(:disabled) {
    background: #e5e5e5;
}

.btn-delete {
    padding: 0.25rem 0.5rem;
    background: #fee;
    color: #c00;
    font-size: 0.875rem;
}

.btn-delete:hover {
    background: #fcc;
}

.status {
    padding: 0.75rem;
    border-radius: 6px;
    font-size: 0.875rem;
    margin-bottom: 1rem;
}

.status.success {
    background: #d4edda;
    color: #155724;
}

.status.error {
    background: #f8d7da;
    color: #721c24;
}

.table-container {
    overflow-x: auto;
    border-radius: 8px;
    border: 1px solid #e5e5e5;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
}

th {
    background: #f8f8f8;
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #e5e5e5;
}

td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid #f0f0f0;
    color: #555;
}

tr:hover td {
    background: #fafafa;
}

.filename {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', monospace;
    font-size: 0.8125rem;
}

.kv-grid {
    display: grid;
    gap: 0.75rem;
}

.kv-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: #f8f8f8;
    border-radius: 8px;
    border: 1px solid #e5e5e5;
}

.kv-key {
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.875rem;
    font-weight: 600;
    color: #0070f3;
    min-width: 120px;
}

.kv-value {
    flex: 1;
    font-size: 0.875rem;
    color: #555;
    word-break: break-all;
}

.empty {
    text-align: center;
    padding: 3rem 1rem;
    color: #999;
    font-style: italic;
}

.footer {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 2px solid #e5e5e5;
}

.stat {
    text-align: center;
}

.stat-value {
    font-size: 2.5rem;
    font-weight: 700;
    color: #0070f3;
    margin-bottom: 0.25rem;
}

.stat-label {
    font-size: 0.875rem;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

@media (max-width: 768px) {
    h1 {
        font-size: 1.75rem;
    }
    
    .form-group {
        flex-direction: column;
    }
    
    .input {
        min-width: 100%;
    }
    
    .card {
        padding: 1rem;
    }
}
</style>
