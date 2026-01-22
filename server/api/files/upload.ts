/**
 * Example R2 Storage API Routes - File Upload
 *
 * Demonstrates file upload to Cloudflare R2
 */

export default defineEventHandler(async (event) => {
    const method = event.method

    // POST - Upload a file
    if (method === 'POST') {
        const form = await readMultipartFormData(event)

        if (!form || form.length === 0) {
            throw createError({
                statusCode: 400,
                message: 'No file uploaded',
            })
        }

        const fileField = form.find(f => f.name === 'file')

        if (!fileField || !fileField.data) {
            throw createError({
                statusCode: 400,
                message: 'File field is required',
            })
        }

        const folder = form.find(f => f.name === 'folder')?.data?.toString() || 'uploads'
        const filename = fileField.filename || 'file'
        const key = `${folder}/${Date.now()}-${filename}`

        // Convert Buffer to ArrayBuffer for R2 compatibility
        const arrayBuffer = fileField.data.buffer.slice(
            fileField.data.byteOffset,
            fileField.data.byteOffset + fileField.data.byteLength
        )

        const uploadedFile = await uploadToR2(event, key, arrayBuffer, {
            contentType: fileField.type,
        })

        return {
            success: true,
            data: uploadedFile,
        }
    }

    throw createError({
        statusCode: 405,
        message: 'Method not allowed. Use POST to upload files.',
    })
})
