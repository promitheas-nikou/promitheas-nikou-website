import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async ({ params, url, redirect }) => {
    try {
        const path = params.path;
        if (!path) return redirect('/404');

        console.log("Fetching file:", path);
        const res = await fetch(
            `https://github.com/promitheas-nikou/eth-work/raw/refs/heads/master/${path}`
        );
        console.log("Response status:", res.status);

        if (!res.ok) return redirect(`/error?code=404&error=Not+Found&context=/eth-files/${path}`);

        // Determine filename: ?filename= query param takes priority,
        // otherwise fall back to the last segment of the path.
        const customFilename = url.searchParams.get("filename");
        const fallbackFilename = path.split("/").pop() || "download";
        const filename = customFilename || fallbackFilename;

        const encodedFilename = encodeURIComponent(filename);

        return new Response(res.body, {
            status: 200,
            headers: {
                "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
                "Content-Disposition": `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodedFilename}`,
            },
        });
    } catch (err) {
        console.error("Proxy route error:", err);
        return redirect('/500');
    }
};