import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const name = searchParams.get('name') || 'download'

    if (!url) {
        return NextResponse.json({ message: 'Missing url parameter' }, { status: 400 })
    }

    // Only allow proxying Cloudinary assets (prevent SSRF)
    try {
        const parsed = new URL(url)
        if (!parsed.hostname.endsWith('res.cloudinary.com')) {
            return NextResponse.json({ message: 'Invalid source URL' }, { status: 400 })
        }
    } catch {
        return NextResponse.json({ message: 'Invalid source URL' }, { status: 400 })
    }

    const res = await fetch(url)

    if (!res.ok) {
        return NextResponse.json({ message: 'Failed to fetch file from Cloudinary' }, { status: 502 })
    }

    const buffer = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    // Cloudinary serves raw files as octet-stream; infer proper MIME from filename
    const ext = name.split('.').pop()?.toLowerCase() || ''
    const MIME_MAP: Record<string, string> = {
        pdf: 'application/pdf',
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        zip: 'application/zip',
        rar: 'application/vnd.rar',
        '7z': 'application/x-7z-compressed',
        tar: 'application/x-tar',
        gz: 'application/gzip',
        txt: 'text/plain',
        csv: 'text/csv',
        json: 'application/json',
        md: 'text/markdown',
        html: 'text/html',
        css: 'text/css',
        js: 'text/javascript',
        ts: 'text/plain',
        doc: 'application/msword',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        xls: 'application/vnd.ms-excel',
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        ppt: 'application/vnd.ms-powerpoint',
        pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        mp3: 'audio/mpeg',
        mp4: 'video/mp4',
        wav: 'audio/wav',
        mov: 'video/quicktime',
    }
    const inferredType = MIME_MAP[ext] || (contentType !== 'application/octet-stream' ? contentType : '')

    return new NextResponse(buffer, {
        status: 200,
        headers: {
            'Content-Type': inferredType || 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(name)}"; filename*=UTF-8''${encodeURIComponent(name)}`,
            'Cache-Control': 'private, max-age=3600',
        },
    })
}
